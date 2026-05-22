function NotebookBar({
  notebooks,
  selectedNotebook,
  canEdit,
  isSharedView,
  onSelectNotebook,
  onCreateNotebook,
  onToggleSharing
}) {
  const shareUrl = selectedNotebook
    ? `${window.location.origin}${window.location.pathname}?notebook=${selectedNotebook.id}`
    : '';

  async function copyShareUrl() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
  }

  return (
    <section className="notebook-bar">
      <div>
        <span className="eyebrow">{isSharedView ? 'Shared Notebook' : 'Notebook'}</span>
        <strong>{selectedNotebook?.title || 'No notebook selected'}</strong>
      </div>

      {!isSharedView && (
        <select
          value={selectedNotebook?.id || ''}
          onChange={(event) => onSelectNotebook(event.target.value)}
          disabled={!notebooks.length}
        >
          {notebooks.map((notebook) => (
            <option key={notebook.id} value={notebook.id}>{notebook.title}</option>
          ))}
        </select>
      )}

      {canEdit && (
        <div className="notebook-actions">
          <button className="plain-button" onClick={onCreateNotebook}>New Notebook</button>
          <button className="plain-button" onClick={() => onToggleSharing(!selectedNotebook.isPublic)}>
            {selectedNotebook.isPublic ? 'Unshare' : 'Share'}
          </button>
          {selectedNotebook.isPublic && <button className="plain-button" onClick={copyShareUrl}>Copy Link</button>}
        </div>
      )}
    </section>
  );
}

export default NotebookBar;
