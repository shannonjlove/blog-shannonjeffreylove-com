import { createFileRoute } from "@tanstack/react-router";
import { ResumeSite } from "@/components/ResumeSite";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: "Shannon J. Love | Executive Portfolio" },
      { name: "description", content: "Creative Director, Executive Producer, and Showrunner — 25+ years across VH1, BET, MTV, and Goldman Sachs." },
      { property: "og:title", content: "Shannon J. Love | Executive Portfolio" },
      { property: "og:description", content: "Creative Director, Executive Producer, and Showrunner — 25+ years across VH1, BET, MTV, and Goldman Sachs." },
    ],
  }),
  component: ResumeSite,
});
