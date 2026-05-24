import { useEffect, useMemo, useState } from 'react';
import AdminLoginModal from './components/AdminLoginModal.jsx';
import ContentCard from './components/ContentCard.jsx';
import ItemEditor from './components/ItemEditor.jsx';
import NotebookBar from './components/NotebookBar.jsx';
import PasswordResetModal from './components/PasswordResetModal.jsx';
import Sidebar from './components/Sidebar.jsx';
import SummaryBand from './components/SummaryBand.jsx';
import { THEME_KEY } from './constants.js';
import { isSupabaseConfigured, supabase } from './lib/supabaseClient.js';
import { getCurrentUserSession, requestPasswordResetEmail, signInUser, signOutUser, signUpUser, updateUserPassword } from './services/authService.js';
import { deleteContentItem, fetchContentItems, importContentItems, saveContentItem } from './services/contentService.js';
import { createNotebook, ensureDefaultNotebook, fetchSharedNotebook, fetchUserNotebooks, updateNotebookSharing } from './services/notebookService.js';
import { buildFolderTree, folderMatchesSelection } from './utils/folders.js';
import { exportJsonFile, importJsonFile, readItems } from './utils/storage.js';

function App() {
  const [items, setItems] = useState(readItems);
  const [notebooks, setNotebooks] = useState([]);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [query, setQuery] = useState('');
  const [folder, setFolder] = useState('all');
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(
    window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')
  );
  const [theme, setTheme] = useState(localStorage.getItem(THEME_KEY) || 'light');
  const [status, setStatus] = useState('Loading content...');
  const [busy, setBusy] = useState(false);

  const sharedNotebookId = new URLSearchParams(window.location.search).get('notebook');
  const isSharedView = Boolean(sharedNotebookId);
  const canEdit = Boolean(user && selectedNotebook && user.id === selectedNotebook.ownerId && !isSharedView);

  useEffect(() => {
    async function bootApp() {
      try {
        const currentUser = await getCurrentUserSession();
        setUser(currentUser);

        if (isSharedView) {
          const sharedNotebook = await fetchSharedNotebook(sharedNotebookId);
          setSelectedNotebook(sharedNotebook);
          setNotebooks(sharedNotebook ? [sharedNotebook] : []);
          setItems(sharedNotebook ? await fetchContentItems(sharedNotebook) : []);
          setStatus(sharedNotebook ? 'Viewing a shared read-only notebook.' : 'Shared notebook was not found or is private.');
          return;
        }

        if (isSupabaseConfigured && !currentUser) {
          setNotebooks([]);
          setSelectedNotebook(null);
          setItems([]);
          setStatus('Create an account or sign in to start your notebook.');
          return;
        }

        const defaultNotebook = await ensureDefaultNotebook(currentUser);
        const loadedNotebooks = await fetchUserNotebooks(currentUser);

        setNotebooks(loadedNotebooks.length ? loadedNotebooks : [defaultNotebook]);
        setSelectedNotebook(defaultNotebook);
        setItems(await fetchContentItems(defaultNotebook));
        setStatus(isSupabaseConfigured ? 'Connected to Supabase.' : 'Local mode: add Supabase keys to use the database.');
      } catch (error) {
        setStatus(`Could not load Supabase data: ${error.message}`);
      }
    }

    bootApp();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setUser(session?.user || null);
        setShowPasswordReset(true);
        setStatus('Choose a new password to finish recovery.');
      }
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const folderTree = useMemo(() => buildFolderTree(items), [items]);

  const filteredItems = useMemo(() => {
    const search = query.trim().toLowerCase();

    return items
      .filter((item) => folderMatchesSelection(item.folder, folder))
      .filter((item) => {
        if (!search) return true;

        return [item.title, item.body, item.url, item.folder, item.tags.join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(search);
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [items, query, folder]);

  async function refreshItems(notebook = selectedNotebook) {
    setItems(await fetchContentItems(notebook));
  }

  async function upsertItem(item) {
    setBusy(true);

    try {
      await saveContentItem(item, items, selectedNotebook, user);
      await refreshItems();
      setEditing(null);
      setStatus(isSupabaseConfigured ? 'Saved to Supabase.' : 'Saved locally.');
    } catch (error) {
      setStatus(`Save failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function removeItem(id) {
    setBusy(true);

    try {
      await deleteContentItem(id, items);
      await refreshItems();
      setStatus(isSupabaseConfigured ? 'Removed from Supabase.' : 'Removed locally.');
    } catch (error) {
      setStatus(`Remove failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function signIn(credentials) {
    if (!credentials.username || !credentials.password) {
      return { ok: false, message: 'Enter your email and password.' };
    }

    try {
      const signedInUser = await signInUser(credentials);
      if (!signedInUser) return { ok: false, message: 'Wrong sign in details.' };

      const defaultNotebook = await ensureDefaultNotebook(signedInUser);
      const loadedNotebooks = await fetchUserNotebooks(signedInUser);

      setUser(signedInUser);
      setNotebooks(loadedNotebooks.length ? loadedNotebooks : [defaultNotebook]);
      setSelectedNotebook(defaultNotebook);
      setItems(await fetchContentItems(defaultNotebook));
      setShowLogin(false);
      setStatus(isSupabaseConfigured ? `Signed in as ${signedInUser.email}.` : 'Signed in with local demo account.');
      return { ok: true };
    } catch (error) {
      setStatus(`Sign in failed: ${error.message}`);
      return { ok: false, message: error.message };
    }
  }

  async function signUp(credentials) {
    if (!isSupabaseConfigured) {
      return { ok: false, message: 'Account creation needs Supabase mode. Use admin / code123 locally.' };
    }

    if (!credentials.username.includes('@')) {
      return { ok: false, message: 'Use a valid email address.' };
    }

    if (credentials.password.length < 6) {
      return { ok: false, message: 'Password must be at least 6 characters.' };
    }

    try {
      const result = await signUpUser(credentials);
      if (!result) return { ok: false, message: 'Supabase did not return a signup result.' };

      setShowLogin(false);
      setStatus(result.needsEmailConfirmation
        ? `Account created for ${result.email}. Check your email, then sign in.`
        : `Account created for ${result.email}. You can sign in now.`
      );
      return { ok: true };
    } catch (error) {
      setStatus(`Create account failed: ${error.message}`);
      return { ok: false, message: error.message };
    }
  }

  async function forgotPassword(credentials) {
    if (!isSupabaseConfigured) {
      return { ok: false, message: 'Password reset needs Supabase mode.' };
    }

    if (!credentials.username.includes('@')) {
      return { ok: false, message: 'Enter the email for your account.' };
    }

    try {
      await requestPasswordResetEmail(credentials.username);
      setShowLogin(false);
      setStatus(`Password reset link sent to ${credentials.username}.`);
      return { ok: true };
    } catch (error) {
      setStatus(`Password reset failed: ${error.message}`);
      return { ok: false, message: error.message };
    }
  }

  async function handleUpdatePassword(password) {
    setBusy(true);

    try {
      const updatedUser = await updateUserPassword(password);
      const currentUser = updatedUser || await getCurrentUserSession();
      const defaultNotebook = await ensureDefaultNotebook(currentUser);
      const loadedNotebooks = await fetchUserNotebooks(currentUser);

      setUser(currentUser);
      setNotebooks(loadedNotebooks.length ? loadedNotebooks : [defaultNotebook]);
      setSelectedNotebook(defaultNotebook);
      setItems(await fetchContentItems(defaultNotebook));
      setShowPasswordReset(false);
      window.history.replaceState({}, '', window.location.pathname);
      setStatus('Password updated. You are signed in.');
      return { ok: true };
    } catch (error) {
      setStatus(`Password update failed: ${error.message}`);
      return { ok: false, message: error.message };
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await signOutUser();
    setUser(null);
    setNotebooks([]);
    setSelectedNotebook(null);
    setItems(readItems());
    setEditing(null);
    setStatus('Signed out.');
  }

  function toggleTheme() {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  }

  async function handleImport(file) {
    const importedItems = await importJsonFile(file);
    if (!importedItems) return;

    setBusy(true);
    try {
      const nextItems = await importContentItems(importedItems, items, selectedNotebook, user);
      setItems(nextItems);
      setStatus(isSupabaseConfigured ? 'Imported JSON into Supabase.' : 'Imported JSON locally.');
    } catch (error) {
      setStatus(`Import failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function selectNotebook(notebookId) {
    const notebook = notebooks.find((entry) => entry.id === notebookId);
    if (!notebook) return;

    setSelectedNotebook(notebook);
    setFolder('all');
    setItems(await fetchContentItems(notebook));
  }

  async function handleCreateNotebook() {
    const title = window.prompt('Notebook name');
    if (!title) return;

    setBusy(true);
    try {
      const notebook = await createNotebook(title, user);
      const loadedNotebooks = await fetchUserNotebooks(user);
      setNotebooks(loadedNotebooks);
      setSelectedNotebook(notebook);
      setItems([]);
      setFolder('all');
      setStatus(`Created notebook: ${notebook.title}`);
    } catch (error) {
      setStatus(`Create notebook failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleSharing(isPublic) {
    setBusy(true);
    try {
      const updatedNotebook = await updateNotebookSharing(selectedNotebook, isPublic);
      setSelectedNotebook(updatedNotebook);
      setNotebooks(notebooks.map((notebook) => (
        notebook.id === updatedNotebook.id ? updatedNotebook : notebook
      )));
      setStatus(isPublic ? 'Notebook sharing is on. Copy the link to share it.' : 'Notebook sharing is off.');
    } catch (error) {
      setStatus(`Sharing update failed: ${error.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app-shell" data-theme={theme}>
      <Sidebar
        folderTree={folderTree}
        selectedFolder={folder}
        items={items}
        onSelectFolder={setFolder}
        onExport={() => exportJsonFile(items)}
        onImport={handleImport}
      />

      <section className="workspace">
        <header className="topbar">
          <div className="search-wrap">
            <span aria-hidden="true">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search links, text, tags, folders"
            />
          </div>

          <div className="admin-slot">
            <button className="plain-button" onClick={toggleTheme}>
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
            {user && !isSharedView ? (
              <>
                {canEdit && (
                  <button
                    className="primary-button"
                    onClick={() => setEditing({ folder: folder === 'all' ? 'general' : folder })}
                  >
                    Add Info
                  </button>
                )}
                <button className="plain-button" onClick={signOut}>Sign Out</button>
              </>
            ) : (
              <button className="primary-button" onClick={() => setShowLogin(true)}>Sign In</button>
            )}
          </div>
        </header>

        <div className="status-banner">
          <span>{status}</span>
          {busy && <strong>Working...</strong>}
        </div>

        <NotebookBar
          notebooks={notebooks}
          selectedNotebook={selectedNotebook}
          canEdit={canEdit}
          isSharedView={isSharedView}
          onSelectNotebook={selectNotebook}
          onCreateNotebook={handleCreateNotebook}
          onToggleSharing={handleToggleSharing}
        />

        <SummaryBand items={items} />

        <section className="content-grid" aria-live="polite">
          {filteredItems.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              admin={canEdit}
              onEdit={() => setEditing(item)}
              onRemove={() => removeItem(item.id)}
            />
          ))}

          {!filteredItems.length && (
            <div className="empty-state">
              <strong>No files found</strong>
              <span>Try a different search or add a new coding note.</span>
            </div>
          )}
        </section>
      </section>

      {showLogin && (
        <AdminLoginModal
          isSupabaseConfigured={isSupabaseConfigured}
          onClose={() => setShowLogin(false)}
          onForgotPassword={forgotPassword}
          onSignIn={signIn}
          onSignUp={signUp}
        />
      )}
      {showPasswordReset && (
        <PasswordResetModal
          busy={busy}
          onClose={() => setShowPasswordReset(false)}
          onUpdatePassword={handleUpdatePassword}
        />
      )}
      {editing && <ItemEditor item={editing} busy={busy} onClose={() => setEditing(null)} onSave={upsertItem} />}
    </main>
  );
}

export default App;
