import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["sign-in", "sign-up", "/landing"]);

const isPublicApiRoute = createRouteMatcher([]);

// adding functionality of protecting unauthorized access to users
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const currentUrl = new URL(req.url);
  const isHomePage = currentUrl.pathname === "/home";
  const isApiRequest = currentUrl.pathname.startsWith("/api");

  // checking access cases to the webpage
  if (userId && isPublicRoute(req) && !isHomePage) {
    return NextResponse.redirect(new URL("/home", req.url));
  }
  if (!userId) {
    if (!isPublicApiRoute && !isPublicRoute) {
      return NextResponse.redirect(new URL("/sign-up", req.url));
    }

    if (isApiRequest && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL("/sign-up", req.url));
    }
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
