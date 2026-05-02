-- Enable pg_net for outbound HTTP from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Private schema for internal config (not exposed via PostgREST)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated, public;

CREATE TABLE IF NOT EXISTS private.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL
);
REVOKE ALL ON private.app_settings FROM anon, authenticated, public;

-- Trigger function: notify mirror endpoint on post insert/update/delete
CREATE OR REPLACE FUNCTION private.notify_post_mirror()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public, extensions
AS $$
DECLARE
  endpoint text;
  secret   text;
  payload  jsonb;
BEGIN
  SELECT value INTO endpoint FROM private.app_settings WHERE key = 'mirror_endpoint';
  SELECT value INTO secret   FROM private.app_settings WHERE key = 'mirror_secret';
  IF endpoint IS NULL OR secret IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'DELETE' THEN
    payload := jsonb_build_object('op', 'delete', 'slug', OLD.slug);
  ELSE
    payload := jsonb_build_object('op', 'upsert', 'post_id', NEW.id);
  END IF;

  PERFORM net.http_post(
    url     := endpoint,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-mirror-secret', secret
    ),
    body    := payload,
    timeout_milliseconds := 8000
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS posts_mirror_aiu ON public.posts;
CREATE TRIGGER posts_mirror_aiu
AFTER INSERT OR UPDATE ON public.posts
FOR EACH ROW EXECUTE FUNCTION private.notify_post_mirror();

DROP TRIGGER IF EXISTS posts_mirror_ad ON public.posts;
CREATE TRIGGER posts_mirror_ad
AFTER DELETE ON public.posts
FOR EACH ROW EXECUTE FUNCTION private.notify_post_mirror();