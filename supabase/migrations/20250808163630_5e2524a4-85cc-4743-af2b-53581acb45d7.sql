-- Ensure vw_top_downloads runs with caller's privileges (security invoker)
ALTER VIEW public.vw_top_downloads SET (security_invoker = true);