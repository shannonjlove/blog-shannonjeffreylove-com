import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Inkwell" },
      { name: "description", content: "About the writer behind Inkwell." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
      <h1 className="font-display text-5xl md:text-6xl font-bold mb-8">About</h1>
      <div className="prose-article text-foreground">
        <p>Inkwell is a personal blog and writing portfolio — a place to publish essays, notes, and design observations without an algorithm in between.</p>
        <p>It's powered by Lovable Cloud and synced to GitHub. Comments are open to anyone with an account; sharing is encouraged.</p>
        <h2>Categories</h2>
        <p>Writing here generally falls into Design, Engineering, Essays, and Notes. Each has its own page accessible from the header.</p>
      </div>
    </div>
  );
}
