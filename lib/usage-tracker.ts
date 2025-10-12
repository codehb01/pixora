import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
export type FeatureType = "bg-removal" | "social-media" | "smart-crop";

const FEATURE_LIMITS = {
  free: 5,
  pro: 100,
  premium: -1,
} as const;

export async function checkUsageLimit(userId: string, feature: FeatureType) {
  // Use upsert to handle first-time users atomically
  const userData = await currentUser();
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {}, // No updates needed for existing users
    create: {
      clerkId: userId,
      // email: userData?.emailAddresses[0]?.emailAddress ?? "",
      name: userData?.fullName ?? "",
      subscriptionStatus: "free",
      bgRemovalCount: 0,
      socialMediaCount: 0,
      smartCropCount: 0,
    },
    select: {
      bgRemovalCount: true,
      socialMediaCount: true,
      smartCropCount: true,
      subscriptionStatus: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }
  const currentCount = getCurrentCount(user, feature);
  const limit =
    FEATURE_LIMITS[user.subscriptionStatus as keyof typeof FEATURE_LIMITS];

  return {
    canUse: limit === -1 || currentCount < limit,
    currentCount,
    limit: limit === -1 ? "unlimited" : limit,
    remaining: limit === -1 ? "unlimited" : Math.max(0, limit - currentCount),
    subscriptionStatus: user.subscriptionStatus,
  };
}

export async function incrementUsage(userId: string, feature: FeatureType) {
  // Ensure user exists before incrementing
  await prisma.user.upsert({
    where: { clerkId: userId },
    update: {}, // No updates needed for existing users
    create: {
      clerkId: userId,

      subscriptionStatus: "free",
      bgRemovalCount: 0,
      socialMediaCount: 0,
      smartCropCount: 0,
    },
  });

  const updateField = getUpdateField(feature);
  await prisma.user.update({
    where: { clerkId: userId },
    data: { [updateField]: { increment: 1 } },
  });

  //   log usage
  // await prisma.usageLog.create({
  //   data: {
  //     userId,
  //     feature,
  //   },
  // });
}

interface UserUsageData {
  bgRemovalCount: number;
  socialMediaCount: number;
  smartCropCount: number;
  subscriptionStatus: string;
}

function getCurrentCount(user: UserUsageData, feature: FeatureType): number {
  switch (feature) {
    case "bg-removal":
      return user.bgRemovalCount;
    case "social-media":
      return user.socialMediaCount;
    case "smart-crop":
      return user.smartCropCount;
    default:
      return 0;
  }
}

function getUpdateField(feature: FeatureType): string {
  switch (feature) {
    case "bg-removal":
      return "bgRemovalCount";
    case "social-media":
      return "socialMediaCount";
    case "smart-crop":
      return "smartCropCount";
    default:
      throw new Error(`Unknown feature: ${feature}`);
  }
}
