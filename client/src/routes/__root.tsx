import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="font-display text-8xl font-bold text-gradient">404</p>
          <h2 className="mt-4 font-display text-2xl font-semibold">Lost in transit</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The page you're looking for has packed its bags and moved on.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-vivid px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-bounce hover:scale-105"
            >
              Take me home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "StayVivid — Book unforgettable stays" },
      {
        name: "description",
        content:
          "Discover and book vibrant hotels around the world. Real-time availability, instant confirmation, and stays you'll remember forever.",
      },
      { property: "og:title", content: "StayVivid — Book unforgettable stays" },
      {
        property: "og:description",
        content: "Discover and book vibrant hotels around the world.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
      <Footer />
      <Toaster richColors position="top-center" duration={2000} />
    </>
  );
}
