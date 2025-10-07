import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkUsageLimit, FeatureType } from "@/lib/usage-tracker";
import prisma from "@/lib/prisma";
export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { feature } = await request.json();

    if (!feature) {
      return NextResponse.json({ error: "Feature required" }, { status: 400 });
    }

    // For development/testing, allow usage check without user
    if (!userId && process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        canUse: true,
        currentCount: 0,
        limit: 5,
        remaining: 5,
        subscriptionStatus: "free",
      });
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usageStatus = await checkUsageLimit(userId, feature as FeatureType);

    return NextResponse.json(usageStatus);
  } catch (error) {
    console.error("Usage check error:", error);
    return NextResponse.json(
      { error: "Failed to check usage" },
      { status: 500 }
    );
  }
}
