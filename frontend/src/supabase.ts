import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yvrkylhdfrnubijczuoi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2cmt5bGhkZnJudWJpamN6dW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0ODk4NDIsImV4cCI6MjA5OTA2NTg0Mn0.0CcH3gdpN8DqJT9SePEVzkne8i1NohJ9ioYVG1KTAM4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
