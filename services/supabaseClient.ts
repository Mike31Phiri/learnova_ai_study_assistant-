import { createClient } from '@supabase/supabase-js';

// Initialize with provided credentials
const supabaseUrl = process.env.SUPABASE_URL || 'https://eivddqnuzaumqvojphyq.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpdmRkcW51emF1bXF2b2pwaHlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTgyMTksImV4cCI6MjA3OTA3NDIxOX0.rP5d496Hp0oQb4ARu_izROm9KapdNCZyK-fuyPHTnqg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);