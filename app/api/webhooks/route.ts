import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  // Get headers
  const payload = await req.text();
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse("Missing Svix headers", { status: 400 });
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET in environment");
  }

  const wh = new Webhook(webhookSecret);

  let event;
  try {
    event = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("❌ Error verifying webhook:", err);
    return new NextResponse("Invalid signature", { status: 400 });
  }

  // Handle events here
  const { type, data } = event;
  console.log(`✅ Clerk webhook event: ${type}`);

  try {
    if (type === "user.created") {
      const { id, email_addresses, first_name, last_name } = data;

      await prisma.user.create({
        data: {
          clerkId: id,
          email: email_addresses?.[0]?.email_address || null,
          name: [first_name, last_name].filter(Boolean).join(" ") || null,
          subscriptionStatus: "free",
          bgRemovalCount: 0,
          socialMediaCount: 0,
          smartCropCount: 0,
        },
      });

      console.log(`✅ User ${id} created in database`);
    }

    if (type === "user.deleted") {
      const { id } = data;

      await prisma.user.delete({
        where: { clerkId: id },
      });

      console.log(`🗑️ User ${id} deleted from database`);
    }

    if (type === "user.updated") {
      const { id, email_addresses, first_name, last_name } = data;

      await prisma.user.update({
        where: { clerkId: id },
        data: {
          email: email_addresses?.[0]?.email_address || null,
          name: [first_name, last_name].filter(Boolean).join(" ") || null,
        },
      });

      console.log(`🔄 User ${id} updated in database`);
    }

    return new NextResponse("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return new NextResponse("Error processing webhook", { status: 500 });
  }
}
