import { supabase } from "@/integrations/supabase/client";

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  category_id: string | null;
  status: string;
  published_at: string | null;
  author_id: string | null;
  view_count: number;
  created_at: string;
  category?: { name: string; slug: string; color: string } | null;
  tags?: string[];
};

export type Category = { id: string; name: string; slug: string; color: string };

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchPosts(opts: {
  categorySlug?: string;
  tag?: string;
  search?: string;
  sort?: "newest" | "oldest" | "popular";
} = {}): Promise<Post[]> {
  let query = supabase
    .from("posts")
    .select("*, category:categories(name,slug,color), post_tags(tag)")
    .eq("status", "published");

  if (opts.search) {
    query = query.or(`title.ilike.%${opts.search}%,excerpt.ilike.%${opts.search}%`);
  }
  if (opts.sort === "oldest") query = query.order("published_at", { ascending: true });
  else if (opts.sort === "popular") query = query.order("view_count", { ascending: false });
  else query = query.order("published_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;

  let posts = (data ?? []).map((p: any) => ({
    ...p,
    tags: (p.post_tags ?? []).map((t: any) => t.tag),
  })) as Post[];

  if (opts.categorySlug) posts = posts.filter((p) => p.category?.slug === opts.categorySlug);
  if (opts.tag) posts = posts.filter((p) => p.tags?.includes(opts.tag!));
  return posts;
}

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*, category:categories(name,slug,color), post_tags(tag)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...data, tags: ((data as any).post_tags ?? []).map((t: any) => t.tag) } as Post;
}
