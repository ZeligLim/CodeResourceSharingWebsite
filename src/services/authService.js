import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { LOCAL_ADMIN_PASS, LOCAL_ADMIN_USER, SESSION_KEY } from '../constants.js';

export async function getCurrentUserSession() {
  if (!isSupabaseConfigured) {
    return sessionStorage.getItem(SESSION_KEY) === 'true'
      ? { id: 'local-user', email: LOCAL_ADMIN_USER }
      : null;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.user || null;
}

export async function signInUser({ username, password }) {
  if (!isSupabaseConfigured) {
    if (username === LOCAL_ADMIN_USER && password === LOCAL_ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      return { id: 'local-user', email: LOCAL_ADMIN_USER };
    }

    return null;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: username,
    password
  });

  if (error) throw error;
  return data.user;
}

export async function signUpUser({ username, password }) {
  if (!isSupabaseConfigured) return signInUser({ username, password });

  const { data, error } = await supabase.auth.signUp({
    email: username,
    password
  });

  if (error) throw error;

  return {
    email: username,
    needsEmailConfirmation: !data.session,
    user: data.user
  };
}

export async function requestPasswordResetEmail(email) {
  if (!isSupabaseConfigured) {
    throw new Error('Password reset needs Supabase mode.');
  }

  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo
  });

  if (error) throw error;
}

export async function updateUserPassword(password) {
  if (!isSupabaseConfigured) {
    throw new Error('Password reset needs Supabase mode.');
  }

  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data.user;
}

export async function signOutUser() {
  if (!isSupabaseConfigured) {
    sessionStorage.removeItem(SESSION_KEY);
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
