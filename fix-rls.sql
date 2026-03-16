-- Run this script in your Supabase SQL Editor to fix the RLS issues

-- Disable RLS for the SignGH table (Easiest solution for internal apps)
ALTER TABLE "public"."SignGH" DISABLE ROW LEVEL SECURITY;

-- Alternatively, if you want to keep RLS enabled but allow all operations for authenticated users,
-- uncomment the following lines:

-- ALTER TABLE "public"."SignGH" ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow all operations for authenticated users" ON "public"."SignGH" FOR ALL TO authenticated USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow insert for anon" ON "public"."SignGH" FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Allow select for anon" ON "public"."SignGH" FOR SELECT TO anon USING (true);

-- You might also want to do this for other tables if you face similar issues:
-- ALTER TABLE "public"."User" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "public"."Member" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "public"."Leader" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "public"."AllianceInformation" DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE "public"."CheckRecord" DISABLE ROW LEVEL SECURITY;
