import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)",
  "/api/uploadthing(.*)",
  "/api/debug(.*)",
  "/api/ai(.*)",
  "/api/test(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Unauthenticated users trying to access protected routes → sign-in
  if (!userId && !isPublicRoute(req)) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Role-based redirects are handled by dashboard/layout.tsx (DB check)
  // and onboarding/page.tsx — NOT here in middleware.
  // Clerk session claims can be stale after onboarding, so relying on
  // sessionClaims.metadata.role here causes redirect loops.

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
