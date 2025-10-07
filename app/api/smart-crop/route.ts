import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  checkUsageLimit,
  FeatureType,
  incrementUsage,
} from "@/lib/usage-tracker";

// Configuration
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  public_id: string;
  secure_url?: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
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

    if (!feature) {
      return NextResponse.json(
        { error: "Feature type required" },
        { status: 400 }
      );
    }

    if (userId) {
      const usageStatus = await checkUsageLimit(userId, feature);

      if (!usageStatus.canUse) {
        return NextResponse.json(
          { error: "Feature limit exceeded" },
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
          { folder: "cloudinary-saas-uploads" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result as CloudinaryUploadResult);
          }
        );

        stream.end(buffer); // ✅ send file contents
      }
    );

    if (userId) {
      await incrementUsage(userId, feature);
    }

    const secureUrl =
      result.secure_url ||
      ((result as Record<string, unknown>).secureUrl as string) ||
      ((result as Record<string, unknown>).url as string);

    return NextResponse.json(
      { publicId: result.public_id, secureUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong while uploading the image" },
      { status: 500 }
    );
  }
}
