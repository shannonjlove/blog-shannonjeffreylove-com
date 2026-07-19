import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listPosts from "./tools/list-posts";
import getPost from "./tools/get-post";
import listCategories from "./tools/list-categories";
import createComment from "./tools/create-comment";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "inkwell-blog",
  title: "Inkwell Blog",
  version: "0.1.0",
  instructions:
    "Tools for the Inkwell blog by Shannon Jeffrey Love. Read published posts and categories, and post comments as the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listPosts, getPost, listCategories, createComment],
});
