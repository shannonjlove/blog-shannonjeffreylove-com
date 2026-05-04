import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ResumeSite } from "@/components/ResumeSite";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Go home
          </Link>
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
      { title: "World Of Words (SJL Written Works)" },
      { name: "description", content: "Creativity as inspired...by LOVE!" },
      { property: "og:title", content: "World Of Words (SJL Written Works)" },
      { name: "twitter:title", content: "World Of Words (SJL Written Works)" },
      { property: "og:description", content: "Creativity as inspired...by LOVE!" },
      { name: "twitter:description", content: "Creativity as inspired...by LOVE!" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/08413d73-9326-45d7-aa86-3a22c2974977/id-preview-3621498d--3e908eda-8202-4c2a-be15-eee663e509ea.lovable.app-1777752371458.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/08413d73-9326-45d7-aa86-3a22c2974977/id-preview-3621498d--3e908eda-8202-4c2a-be15-eee663e509ea.lovable.app-1777752371458.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const host = typeof window !== "undefined" ? window.location.hostname : "";
  const isResumeHost = host.startsWith("resume.");
  const isResumeRoute = pathname === "/resume";

  if (isResumeHost || isResumeRoute) {
    return <ResumeSite />;
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]"><Outlet /></main>
      <SiteFooter />
    </>
  );
}
