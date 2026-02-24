import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN") || "haziri_token"
const WHATSAPP_ACCESS_TOKEN = Deno.env.get("WHATSAPP_ACCESS_TOKEN")
const WHATSAPP_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID")

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

/**
 * Utility to calculate the distance between two points on Earth using the Haversine formula.
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // In meters
}

serve(async (req) => {
    const { method } = req
    const url = new URL(req.url)

    // 1. Meta Webhook Verification (GET)
    if (method === "GET") {
        const mode = url.searchParams.get("hub.mode")
        const token = url.searchParams.get("hub.verify_token")
        const challenge = url.searchParams.get("hub.challenge")

        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("Webhook verified successfully!")
            return new Response(challenge, { status: 200 })
        }
        return new Response("Forbidden", { status: 403 })
    }

    // 2. Incoming Messages (POST)
    try {
        const body = await req.json()
        console.log("Incoming Webhook Payload:", JSON.stringify(body, null, 2))

        const entry = body.entry?.[0]
        const changes = entry?.changes?.[0]
        const value = changes?.value
        const message = value?.messages?.[0]

        if (!message) {
            return new Response("OK", { status: 200 })
        }

        const sender = message.from // This is the user's WhatsApp ID (usually phone number)
        const messageType = message.type

        // Find employee by WhatsApp number
        // Note: WhatsApp numbers in Meta payload often look like "919876543210"
        const { data: employee, error: empError } = await supabase
            .from("employees")
            .select("*")
            .eq("whatsapp_number", sender)
            .single()

        if (empError || !employee) {
            console.log(`Unregistered user: ${sender}`)
            await sendWhatsAppMessage(sender, "Namaste! 🙏 Aapka number registered nahi hai. Kripya apne manager se sampark karein.")
            return new Response("OK", { status: 200 })
        }

        if (messageType === "location") {
            const { latitude, longitude } = message.location
            console.log(`Received location from ${employee.name}: ${latitude}, ${longitude}`)

            // Check if employee is allowed to punch anywhere
            if (employee.allow_anywhere_checkin) {
                await logAttendance(employee, latitude, longitude, 0, null)
                await sendWhatsAppMessage(sender, `✅ Dhanyawad ${employee.name}! Aapki attendance lag gayi hai. (Field Duty Mode)`)
                return new Response("OK", { status: 200 })
            }

            // Fetch sites for this organization
            const { data: sites, error: siteError } = await supabase
                .from("locations")
                .select("*")
                .eq("org_id", employee.org_id)

            if (siteError || !sites || sites.length === 0) {
                await sendWhatsAppMessage(sender, "❌ Error: Company ke pas koi site defined nahi hai. Admin se sampark karein.")
                return new Response("OK", { status: 200 })
            }

            // Filter if pinned to specific site
            const targetSites = employee.assigned_site_id
                ? sites.filter(s => s.id === employee.assigned_site_id)
                : sites

            let nearestSite = null
            let minDistance = Infinity

            for (const site of targetSites) {
                const dist = calculateDistance(latitude, longitude, site.latitude, site.longitude)
                if (dist < minDistance) {
                    minDistance = dist
                    nearestSite = site
                }
            }

            if (nearestSite && minDistance <= 50) {
                await logAttendance(employee, latitude, longitude, minDistance, nearestSite.id)
                await sendWhatsAppMessage(sender, `✅ Presentation Marked! Site: ${nearestSite.name}\nDistance: ${Math.round(minDistance)}m. Have a great day!`)
            } else {
                const locationName = employee.assigned_site_id && nearestSite ? nearestSite.name : "Company Site"
                await sendWhatsAppMessage(sender, `❌ Attendance Failed! Aap ${locationName} se bahar hain.\nDistance: ${Math.round(minDistance)}m. Kripya 50m ke andar rahein.`)
            }
        } else {
            // General query
            await sendWhatsAppMessage(sender, `Hajiri Bot ✨\n\nDaily attendance lagane ke liye kripya apni 'Live Location' share karein. 👇`)
        }

        return new Response("OK", { status: 200 })

    } catch (err) {
        console.error("Webhook processing error:", err)
        return new Response("Error", { status: 500 })
    }
})

/**
 * Log attendance record to Supabase
 */
async function logAttendance(employee: any, lat: number, lon: number, distance: number, siteId: string | null) {
    const { error } = await supabase.from("attendance").insert({
        employee_id: employee.id,
        latitude: lat,
        longitude: lon,
        distance_meters: distance,
        verified_location_id: siteId,
        status: 'Present',
        org_id: employee.org_id,
        date: new Date().toISOString().split('T')[0],
        in_time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    })

    if (error) {
        console.error("Failed to log attendance:", error)
    }
}

/**
 * Send WhatsApp text message using Meta Cloud API
 */
async function sendWhatsAppMessage(to: string, text: string) {
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_ID) {
        console.warn("WhatsApp credentials not set. Message not sent:", text)
        return
    }

    try {
        const response = await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                to: to,
                type: "text",
                text: { body: text }
            })
        })

        const data = await response.json()
        if (!response.ok) {
            console.error("Meta API Error:", data)
        }
    } catch (err) {
        console.error("Failed to send WhatsApp message:", err)
    }
}
