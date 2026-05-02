CREATE TABLE public.category_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medium_key text NOT NULL UNIQUE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.category_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mappings public read"
ON public.category_mappings FOR SELECT
USING (true);

CREATE POLICY "Admins manage mappings"
ON public.category_mappings FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_category_mappings_key ON public.category_mappings(medium_key);