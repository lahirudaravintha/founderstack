import { clerkMiddleware } from "@clerk/nextjs/server";

// Use Clerk middleware to parse auth tokens but don't block requests.
// Individual API route handlers check auth via requireAuth().
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
