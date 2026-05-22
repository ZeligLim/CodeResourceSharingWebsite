import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js';
import { readItems, saveItems } from '../utils/storage.js';

const TABLE_NAME = 'coding_items';
const IMAGE_BUCKET = 'coding-images';

function toAppItem(row) {
  return {
    id: row.id,
    notebookId: row.notebook_id,
    ownerId: row.owner_id,
    type: row.type,
    title: row.title,
    body: row.body,
    url: row.url || '',
    folder: row.folder || 'general',
    tags: row.tags || [],
    image: row.image_url || '',
    createdAt: row.created_at
  };
}

function toDatabaseRow(item, notebook, user) {
  return {
    id: item.id,
    notebook_id: notebook.id,
    owner_id: user.id,
    type: item.type,
    title: item.title,
    body: item.body,
    url: item.url || null,
    folder: item.folder || 'general',
    tags: item.tags || [],
    image_url: item.image || null,
    created_at: item.createdAt || new Date().toISOString()
  };
}

function dataUrlToFileParts(dataUrl) {
  const [metadata, base64] = dataUrl.split(',');
  const mimeType = metadata.match(/data:(.*);base64/)?.[1] || 'image/png';
  const extension = mimeType.split('/')[1] || 'png';
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

  return {
    blob: new Blob([bytes], { type: mimeType }),
    extension,
    mimeType
  };
}

async function uploadImageIfNeeded(item) {
  if (!item.image?.startsWith('data:')) return item.image || '';

  const { blob, extension, mimeType } = dataUrlToFileParts(item.image);
  const filePath = `${item.id || crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(filePath, blob, {
      contentType: mimeType,
      upsert: true
    });

  if (error) throw error;

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function fetchContentItems(notebook) {
  if (!isSupabaseConfigured) return readItems();
  if (!notebook) return [];

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('notebook_id', notebook.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data.map(toAppItem);
}

export async function saveContentItem(item, currentItems, notebook, user) {
  const itemToSave = {
    ...item,
    id: item.id || crypto.randomUUID(),
    createdAt: item.createdAt || new Date().toISOString()
  };

  if (!isSupabaseConfigured) {
    const exists = currentItems.some((entry) => entry.id === itemToSave.id);
    const nextItems = exists
      ? currentItems.map((entry) => (entry.id === itemToSave.id ? itemToSave : entry))
      : [itemToSave, ...currentItems];

    saveItems(nextItems);
    return itemToSave;
  }

  if (!notebook || !user) throw new Error('Sign in and select a notebook before saving.');

  const image = await uploadImageIfNeeded(itemToSave);
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .upsert(toDatabaseRow({ ...itemToSave, image }, notebook, user), { onConflict: 'id' })
    .select()
    .single();

  if (error) throw error;
  return toAppItem(data);
}

export async function deleteContentItem(id, currentItems) {
  if (!isSupabaseConfigured) {
    const nextItems = currentItems.filter((item) => item.id !== id);
    saveItems(nextItems);
    return;
  }

  const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
  if (error) throw error;
}

export async function importContentItems(importedItems, currentItems, notebook, user) {
  if (!isSupabaseConfigured) {
    saveItems(importedItems);
    return importedItems;
  }

  if (!notebook || !user) throw new Error('Sign in and select a notebook before importing.');

  const rows = importedItems.map((item) => toDatabaseRow({
    ...item,
    id: item.id || crypto.randomUUID(),
    createdAt: item.createdAt || new Date().toISOString()
  }, notebook, user));

  const { error } = await supabase.from(TABLE_NAME).upsert(rows, { onConflict: 'id' });
  if (error) throw error;

  return fetchContentItems(notebook);
}
