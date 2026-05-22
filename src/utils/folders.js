export function normalizeFolderPath(folder) {
  const normalized = String(folder || 'general')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
    .join('/');

  return normalized || 'general';
}

export function folderMatchesSelection(itemFolder, selectedFolder) {
  if (selectedFolder === 'all') return true;

  const normalizedItemFolder = normalizeFolderPath(itemFolder);
  const normalizedSelectedFolder = normalizeFolderPath(selectedFolder);

  return normalizedItemFolder === normalizedSelectedFolder
    || normalizedItemFolder.startsWith(`${normalizedSelectedFolder}/`);
}

export function countItemsInFolder(items, folderPath) {
  return items.filter((item) => folderMatchesSelection(item.folder, folderPath)).length;
}

export function buildFolderTree(items) {
  const root = [];
  const nodeMap = new Map();

  items.forEach((item) => {
    const parts = normalizeFolderPath(item.folder).split('/');

    parts.forEach((part, index) => {
      const path = parts.slice(0, index + 1).join('/');
      const parentPath = parts.slice(0, index).join('/');

      if (!nodeMap.has(path)) {
        const node = {
          name: part,
          path,
          children: []
        };

        nodeMap.set(path, node);

        if (parentPath) {
          nodeMap.get(parentPath).children.push(node);
        } else {
          root.push(node);
        }
      }
    });
  });

  function sortNodes(nodes) {
    return nodes
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((node) => ({
        ...node,
        children: sortNodes(node.children)
      }));
  }

  return sortNodes(root);
}
