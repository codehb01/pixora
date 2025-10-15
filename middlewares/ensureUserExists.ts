import prisma from "@/lib/prisma";

export async function ensureUserExists(clerkId: string) {
  const existingUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!existingUser) {
    await prisma.user.create({
      data: {
        clerkId,
        subscriptionStatus: "free",
        bgRemovalCount: 0,
        socialMediaCount: 0,
        smartCropCount: 0,
        // watermarkCount: 0,
      },
    });
  }

  return existingUser;
}
