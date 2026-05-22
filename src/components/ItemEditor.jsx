import { useState } from 'react';
import { normalizeFolderPath } from '../utils/folders.js';

function ItemEditor({ item, busy, onClose, onSave }) {
  const [draft, setDraft] = useState({
    id: item.id,
    type: item.type || 'link',
    title: item.title || '',
    body: item.body || '',
    url: item.url || '',
    folder: item.folder || 'general',
    tags: item.tags?.join(', ') || '',
    image: item.image || '',
    createdAt: item.createdAt || new Date().toISOString()
  });

  function update(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function save(event) {
    event.preventDefault();
    onSave({
      ...draft,
      folder: normalizeFolderPath(draft.folder),
      tags: draft.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
    });
  }

  // Converts an uploaded picture into a data URL so it can live in localStorage.
  function loadImage(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => update('image', reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="modal-panel editor-modal" onSubmit={save}>
        <header>
          <div>
            <h2>{item.id ? 'Edit Coding Info' : 'Add Coding Info'}</h2>
            <p>Save a link, text note, folder, tags, and optional picture.</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">×</button>
        </header>

        <label>
          Type
          <select value={draft.type} onChange={(event) => update('type', event.target.value)}>
            <option value="link">Link</option>
            <option value="text">Text</option>
          </select>
        </label>

        <label>
          Title
          <input value={draft.title} onChange={(event) => update('title', event.target.value)} required />
        </label>

        <label>
          Text
          <textarea value={draft.body} onChange={(event) => update('body', event.target.value)} required />
        </label>

        <label>
          Link URL
          <input value={draft.url} onChange={(event) => update('url', event.target.value)} placeholder="https://example.com" />
        </label>

        <div className="form-pair">
          <label>
            Folder
            <input value={draft.folder} onChange={(event) => update('folder', event.target.value)} placeholder="frontend/react/hooks" />
          </label>
          <label>
            Tags
            <input value={draft.tags} onChange={(event) => update('tags', event.target.value)} placeholder="react, api" />
          </label>
        </div>

        <label className="upload-box">
          <span>Add Picture</span>
          <input type="file" accept="image/*" onChange={(event) => loadImage(event.target.files?.[0])} />
        </label>

        {draft.image && (
          <div className="preview-row">
            <img src={draft.image} alt="" />
            <button type="button" className="danger-button" onClick={() => update('image', '')}>Remove Picture</button>
          </div>
        )}

        <footer>
          <button type="button" className="plain-button" onClick={onClose}>Cancel</button>
          <button className="primary-button" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
        </footer>
      </form>
    </div>
  );
}

export default ItemEditor;
