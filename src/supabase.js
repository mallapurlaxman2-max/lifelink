import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nteeukzufsmvzovrsavy.supabase.co";
const SUPABASE_KEY = "sb_publishable_qszgEd3YTCIrxZsCb5w4JA_OQ0XdD11";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
