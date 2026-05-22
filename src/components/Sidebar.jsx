import { countItemsInFolder } from '../utils/folders.js';

function FolderNode({ node, depth, selectedFolder, items, onSelectFolder }) {
  const isSelected = selectedFolder === node.path;

  return (
    <>
      <button
        className={isSelected ? 'tree-row active child' : 'tree-row child'}
        style={{ '--folder-depth': depth }}
        onClick={() => onSelectFolder(node.path)}
      >
        <span className="folder-icon">{node.children.length ? '●' : '○'}</span>
        <span>{node.name}</span>
        <small>{countItemsInFolder(items, node.path)}</small>
      </button>

      {node.children.map((child) => (
        <FolderNode
          key={child.path}
          node={child}
          depth={depth + 1}
          selectedFolder={selectedFolder}
          items={items}
          onSelectFolder={onSelectFolder}
        />
      ))}
    </>
  );
}

function Sidebar({ folderTree, selectedFolder, items, onSelectFolder, onExport, onImport }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">{'</>'}</div>
        <div>
          <h1>Coding Share Hub</h1>
          <p>Curated notes, links, and visuals for developers.</p>
        </div>
      </div>

      <section className="file-system" aria-label="Content file system">
        <div className="section-title">File System</div>
        <button
          className={selectedFolder === 'all' ? 'tree-row active' : 'tree-row'}
          onClick={() => onSelectFolder('all')}
        >
          <span className="folder-icon">●</span>
          <span>/knowledge</span>
          <small>{items.length}</small>
        </button>

        {folderTree.map((node) => (
          <FolderNode
            key={node.path}
            node={node}
            depth={1}
            selectedFolder={selectedFolder}
            items={items}
            onSelectFolder={onSelectFolder}
          />
        ))}
      </section>

      <section className="storage-panel">
        <div className="section-title">Storage</div>
        <button className="plain-button" onClick={onExport}>Export JSON</button>
        <label className="plain-button file-button">
          Import JSON
          <input type="file" accept="application/json" onChange={(event) => onImport(event.target.files?.[0])} />
        </label>
      </section>
    </aside>
  );
}

export default Sidebar;
