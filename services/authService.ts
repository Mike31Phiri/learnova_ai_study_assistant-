import { supabase } from './supabaseClient';
import { UserProfile } from '../types';

export const authService = {
  async signUp(email: string, password: string, metadata: { full_name: string, university: string, program: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.full_name,
          university: metadata.university,
          program: metadata.program
        },
      },
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    return { subscription: data.subscription };
  },

  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);
    return { error };
  }
};