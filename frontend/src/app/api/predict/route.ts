import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "../../../lib/mongodb";
import History from "../../../models/History";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const imageFile = formData.get("imagefile") as File;

        if (!imageFile) {
            return NextResponse.json({ error: "No image file provided" }, { status: 400 });
        }

        // 1. Forward the request to the high-performance Flask backend (Strict IPv4)
        const flaskBackendUrl = "http://127.0.0.1:5000/api/predict_json";
        
        // 1. Pre-flight health check to ensure backend is ready (Strict IPv4)
        try {
            const healthCheck = await fetch("http://127.0.0.1:5000/api/health", { signal: AbortSignal.timeout(5000) });
            if (!healthCheck.ok) {
                return NextResponse.json(
                    { error: "AI Engine is still warming up. Please try again in 30 seconds." }, 
                    { status: 503 }
                );
            }
        } catch (hErr) {
            console.warn("[Next.js BRIDGE] Health check failed, fetching boot logs...");
            let bootLogs = "No logs available.";
            try {
                const logsRes = await fetch("http://localhost:5000/api/logs", { signal: AbortSignal.timeout(2000) });
                if (logsRes.ok) bootLogs = await logsRes.text();
            } catch (lErr) {}

            return NextResponse.json(
                { 
                    error: "AI Engine is initializing. Please wait a moment and try again.",
                    backendLogs: bootLogs 
                }, 
                { status: 503 }
            );
        }

        const backendFormData = new FormData();
        backendFormData.append("imagefile", imageFile);

        const response = await fetch(flaskBackendUrl, {
            method: "POST",
            body: backendFormData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("[Next.js BRIDGE] Flask backend error:", errorText);
            return NextResponse.json(
                { error: "Backend prediction failed", details: errorText }, 
                { status: response.status }
            );
        }

        const parsedData = await response.json();

        // 2. Post-process: Convert image to Base64 for session persistence/UI display
        try {
            const arrayBuffer = await imageFile.arrayBuffer();
            const imageBuffer = Buffer.from(arrayBuffer);
            const ext = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
            const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
            const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
            parsedData.imageUrl = base64Image;
        } catch (imgErr) {
            console.warn("[Next.js BRIDGE] Could not encode image to base64:", imgErr);
        }

        // 3. SERVER-SIDE AUTO-SAVE (Ensures "data history stored must be")
        const session = await getServerSession(authOptions) as any;
        if (session && session.user) {
            try {
                await dbConnect();
                const newHistory = await History.create({
                    userId: session.user.id,
                    title: parsedData.title,
                    ingredients: parsedData.ingredients,
                    recipe: parsedData.recipe,
                    imageUrl: parsedData.imageUrl, // Store base64 or link
                });
                parsedData._id = newHistory._id; // Provide the ID for immediate sharing
                console.log("[SERVER SAVE] History record created:", newHistory._id);
            } catch (saveErr) {
                console.error("[SERVER SAVE] Failed to auto-save history:", saveErr);
            }
        }

        return NextResponse.json(parsedData);

    } catch (error: any) {
        console.error("[Next.js BRIDGE] Global Bridge Error:", error);
        
        // Final attempt: try to fetch backend logs to explain the failure
        let logs = "Could not retrieve backend logs.";
        try {
            const logsRes = await fetch("http://localhost:5000/api/logs", { signal: AbortSignal.timeout(2000) });
            if (logsRes.ok) logs = await logsRes.text();
        } catch (lErr) {}

        return NextResponse.json(
            { 
                error: "Internal Server Error", 
                details: error.message,
                backendLogs: logs 
            }, 
            { status: 500 }
        );
    }
}
