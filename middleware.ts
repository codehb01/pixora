import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in",
  "/sign-up",
]);

const isPublicApiRoute = createRouteMatcher([
  "/api/upload", // Allow uploads for testing
  "/api/usage-check", // Allow usage check for testing
  "/api/bg-remove", // Allow bg-remove for testing
  "/api/smart-crop", // Allow smart-crop for testing
  "/api/social-media", // Allow social-media for testing
  // Add other public API routes here if needed
]);

// adding functionality of protecting unauthorized access to users
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const currentUrl = new URL(req.url);
  const isHomePage = currentUrl.pathname === "/home";
  const isApiRequest = currentUrl.pathname.startsWith("/api");

  // For API routes, return JSON error instead of redirect
  if (isApiRequest && !userId && !isPublicApiRoute(req)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Please sign in to access this feature",
      },
      { status: 401 }
    );
  }

  // checking access cases to the webpage
  if (userId && isPublicRoute(req) && !isHomePage) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  if (!userId && !isPublicRoute(req) && !isApiRequest) {
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  // checking done now do further process middlewares work is done
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
