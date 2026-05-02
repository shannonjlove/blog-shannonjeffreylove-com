CREATE OR REPLACE FUNCTION public.set_mirror_settings(_endpoint text, _secret text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
BEGIN
  INSERT INTO private.app_settings(key, value) VALUES ('mirror_endpoint', _endpoint)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
  INSERT INTO private.app_settings(key, value) VALUES ('mirror_secret', _secret)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
END;
$$;

REVOKE ALL ON FUNCTION public.set_mirror_settings(text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_mirror_settings(text, text) TO service_role;