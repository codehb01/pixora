import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Configuration
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
  // Log config status for debugging
  console.log("🔧 Cloudinary config check:", {
    hasCloudName: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    hasApiKey: !!process.env.CLOUDINARY_API_KEY,
    hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
  });

  // Allow dev uploads without auth for testing
  const { userId } = await auth();
  if (!userId && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("📁 File received:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    // Convert File -> Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log("🔄 Buffer created, size:", buffer.length);

    // Upload to Cloudinary
    const result = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "cloudinary-saas-uploads",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary error:", error);
              return reject(error);
            }
            console.log("✅ Upload successful:", {
              public_id: result?.public_id,
            });
            resolve(result as CloudinaryUploadResult);
          }
        );

        stream.end(buffer);
      }
    );

    // Return both publicId and secureUrl
    return NextResponse.json(
      {
        publicId: result.public_id,
        secureUrl: result.secure_url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("💥 Upload error:", error);

    // Return detailed error in development
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const response = {
      error: "Upload failed",
      ...(process.env.NODE_ENV === "development" && {
        details: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      }),
    };

    return NextResponse.json(response, { status: 500 });
  }
}
