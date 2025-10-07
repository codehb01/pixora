import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  checkUsageLimit,
  incrementUsage,
  FeatureType,
} from "@/lib/usage-tracker";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  console.log("🔧 Upload route called");

  const { userId } = await auth();

  if (!userId && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const feature = formData.get("feature") as FeatureType | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("📁 File received:", { name: file.name, size: file.size });

    // Check usage limit before processing (only for authenticated users)
    if (userId && feature) {
      const usageStatus = await checkUsageLimit(userId, feature);

      if (!usageStatus.canUse) {
        return NextResponse.json(
          {
            error: "Usage limit exceeded",
            usageStatus,
          },
          { status: 403 }
        );
      }
    }

    // Convert File -> Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "pixora-uploads",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary error:", error);
              return reject(error);
            }
            console.log("✅ Upload successful:", result?.public_id);
            resolve(result as CloudinaryUploadResult);
          }
        );
        stream.end(buffer);
      }
    );

    // Increment usage after successful upload
    if (userId && feature) {
      await incrementUsage(userId, feature);
    }

    return NextResponse.json({
      publicId: result.public_id,
      secureUrl: result.secure_url,
    });
  } catch (error) {
    console.error("💥 Upload error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Upload failed",
        ...(process.env.NODE_ENV === "development" && {
          details: errorMessage,
        }),
      },
      { status: 500 }
    );
  }
}
