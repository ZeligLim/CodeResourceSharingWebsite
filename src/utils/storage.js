import { STORAGE_KEY } from '../constants.js';
import { defaultItems } from '../data/defaultItems.js';

export function readItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultItems;
  } catch {
    return defaultItems;
  }
}

export function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// Downloads the current browser-stored content as a portable JSON file.
export function exportJsonFile(items) {
  const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'coding-share-hub-content.json';
  link.click();
  URL.revokeObjectURL(url);
}

// Reads a JSON export back into the app. Invalid files are ignored safely.
export async function importJsonFile(file) {
  if (!file) return null;

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
