import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brfdajgboitvlhravmki.supabase.co';
const supabaseKey = 'sb_publishable_ePUBHvVXsxQ6OD02dqsynQ_x6S2JPKE';

export const supabase = createClient(supabaseUrl, supabaseKey);
