# Coding Share Hub

A React website for sharing coding information. It lets people create accounts, keep separate coding notebooks, browse nested folders, add links/text/pictures, and share read-only notebook links with others.

## How to Run

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Vite will print a local URL, usually:

```text
http://127.0.0.1:5173/
```

Open that URL in your browser.

## Accounts

If Supabase is not configured yet, the app uses this local demo login:

```text
Username: admin
Password: code123
```

After Supabase is configured, the popup sign-in form uses Supabase Auth email/password. Users can create accounts from the same popup.

## What the App Can Do

- Browse coding content by folder in the left file-system panel.
- Search by title, text, URL, folder, or tag.
- Add links or text notes from the admin UI.
- Add an optional picture to each entry.
- Edit or remove existing entries when signed in.
- Create multiple notebooks per account.
- Share a notebook as a read-only public link.
- Export all content to a JSON file.
- Import a JSON file back into the app.
- Switch between light mode and dark mode.

## Supabase Setup

The app can run in two modes:

- **Local mode:** stores data in browser `localStorage`.
- **Supabase mode:** stores links/text in Supabase Postgres, stores pictures in Supabase Storage, and uses Supabase Auth for admin sign in.

To enable Supabase mode:

1. Create a free Supabase project.
2. Open the Supabase SQL Editor.
3. Run the SQL from `supabase/schema.sql`.
4. In Supabase, go to **Authentication > Providers** and make sure **Email** is enabled.
5. Create a `.env` file in this project using `.env.example` as the template:

```bash
cp .env.example .env
```

6. Fill in your Supabase values:

```text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

7. Restart the dev server:

```bash
npm run dev
```

The app will show a status message that says it is connected to Supabase. From there, users can create accounts in the sign-in popup.

## Important Storage Note

This project is frontend-only. Without Supabase keys, it does not write content directly into your computer's folders like a backend server would.

Instead, it stores content in the browser using `localStorage`. The **Export JSON** and **Import JSON** buttons give you a simple file-based workflow:

- Export creates a `coding-share-hub-content.json` file.
- Import reads a compatible JSON file and replaces the browser-stored content.

With Supabase configured, the same UI stores content in your Supabase database instead.

## Notebook Sharing

When signed in, each account can create notebooks from the notebook bar.

To share a notebook:

1. Select the notebook.
2. Click **Share**.
3. Click **Copy Link**.
4. Send that link to someone else.

Shared notebooks are read-only for visitors. Only the notebook owner can edit.

## Project Structure

```text
.
├── index.html
├── package.json
├── README.md
└── src
    ├── App.jsx
    ├── main.jsx
    ├── styles.css
    ├── constants.js
    ├── components
    │   ├── AdminLoginModal.jsx
    │   ├── ContentCard.jsx
    │   ├── ItemEditor.jsx
    │   ├── NotebookBar.jsx
    │   ├── Sidebar.jsx
    │   └── SummaryBand.jsx
    ├── data
    │   └── defaultItems.js
    ├── lib
    │   └── supabaseClient.js
    ├── services
    │   ├── authService.js
    │   ├── contentService.js
    │   └── notebookService.js
    └── utils
        └── storage.js
```

## File Guide

`src/main.jsx`

Starts React and renders the app into `index.html`.

`src/App.jsx`

The main app controller. It owns the content list, search text, selected folder, admin session state, modal state, and dark mode state.

`src/constants.js`

Stores shared values such as localStorage keys and the local demo admin username/password.

`src/data/defaultItems.js`

Contains starter coding content shown when the browser has no saved content yet.

`src/utils/storage.js`

Contains helper functions for reading content from localStorage, saving content, exporting JSON, and importing JSON.

`src/lib/supabaseClient.js`

Creates the Supabase client when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are available.

`src/services/authService.js`

Handles account sign in, sign up, and sign out. It uses Supabase Auth when configured and local demo auth otherwise.

`src/services/contentService.js`

Handles loading, saving, deleting, importing, and image uploads. It uses Supabase database/storage when configured and localStorage otherwise.

`src/services/notebookService.js`

Handles notebook creation, notebook selection, and public sharing state.

`src/components/AdminLoginModal.jsx`

The popup sign-in window. It collects username and password, then calls the sign-in function from `App.jsx`.

`src/components/ContentCard.jsx`

Displays one coding item card, including its image/code preview, title, text, tags, link button, and admin edit/remove buttons.

`src/components/ItemEditor.jsx`

The popup form for adding or editing coding information. It also converts uploaded pictures into browser-safe data URLs.

`src/components/NotebookBar.jsx`

Shows the current notebook, lets users switch notebooks, create notebooks, and turn sharing on or off.

`src/components/Sidebar.jsx`

Shows the file-system-style folder list and the JSON import/export buttons.

`src/components/SummaryBand.jsx`

Shows quick counts for links, text notes, and pictures.

`src/styles.css`

Controls the visual design. It uses CSS variables so light mode and dark mode share the same layout but swap colors.

## Build for Production

```bash
npm run build
```

The production files will be generated in `dist/`.
