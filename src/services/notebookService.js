import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';

const LOCAL_NOTEBOOK = {
  id: 'local-notebook',
  title: 'My Coding Notebook',
  ownerId: 'local-user',
  isPublic: false,
  createdAt: new Date().toISOString()
};

function toNotebook(row) {
  return {
    id: row.id,
    title: row.title,
    ownerId: row.owner_id,
    isPublic: row.is_public,
    createdAt: row.created_at
  };
}

export async function fetchUserNotebooks(user) {
  if (!isSupabaseConfigured) return [LOCAL_NOTEBOOK];
  if (!user) return [];

  const { data, error } = await supabase
    .from('notebooks')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data.map(toNotebook);
}

export async function fetchSharedNotebook(id) {
  if (!isSupabaseConfigured || !id) return null;

  const { data, error } = await supabase
    .from('notebooks')
    .select('*')
    .eq('id', id)
    .eq('is_public', true)
    .maybeSingle();

  if (error) throw error;
  return data ? toNotebook(data) : null;
}

export async function createNotebook(title, user) {
  if (!isSupabaseConfigured) return LOCAL_NOTEBOOK;
  if (!user) throw new Error('Sign in before creating a notebook.');

  const { data, error } = await supabase
    .from('notebooks')
    .insert({
      title: title || 'Untitled Notebook',
      owner_id: user.id
    })
    .select()
    .single();

  if (error) throw error;
  return toNotebook(data);
}

export async function ensureDefaultNotebook(user) {
  const notebooks = await fetchUserNotebooks(user);
  if (notebooks.length) return notebooks[0];
  return createNotebook('My Coding Notebook', user);
}

export async function updateNotebookSharing(notebook, isPublic) {
  if (!isSupabaseConfigured) return { ...notebook, isPublic };

  const { data, error } = await supabase
    .from('notebooks')
    .update({ is_public: isPublic })
    .eq('id', notebook.id)
    .select()
    .single();

  if (error) throw error;
  return toNotebook(data);
}
