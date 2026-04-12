-- Run in Supabase: SQL Editor (or any PostgreSQL client connected to your project).
-- Drops every public table whose name starts with session_ (CSV upload tables from this app).
-- Review first if you use other tables with the same prefix.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename LIKE 'session\_%' ESCAPE '\'
  LOOP
    EXECUTE format('DROP TABLE IF EXISTS %I.%I CASCADE', 'public', r.tablename);
  END LOOP;
END $$;
