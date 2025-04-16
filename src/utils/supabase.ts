import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TodoTable {
  id: number;
  created_at: string;
  text: string;
  status: 'todo' | 'inProgress' | 'done';
  started_at?: string;
  completed_at?: string;
  user_id?: string;
} 