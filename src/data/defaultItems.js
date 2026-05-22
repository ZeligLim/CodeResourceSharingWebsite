export const defaultItems = [
  {
    id: crypto.randomUUID(),
    type: 'link',
    title: 'React documentation',
    body: 'Component patterns, hooks, and reference material for building interfaces.',
    url: 'https://react.dev/',
    folder: 'frontend/react',
    tags: ['react', 'docs'],
    image: '',
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    type: 'text',
    title: 'Debugging checklist',
    body: 'Reproduce the bug, isolate the smallest failing case, inspect state at the boundary, then add a regression test before polishing the fix.',
    url: '',
    folder: 'workflow/debugging',
    tags: ['debugging', 'testing'],
    image: '',
    createdAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    type: 'text',
    title: 'Clean API notes',
    body: 'Prefer clear names, stable response shapes, useful errors, and examples that can be copied into a real project.',
    url: '',
    folder: 'backend/api-design',
    tags: ['api', 'design'],
    image: '',
    createdAt: new Date().toISOString()
  }
];
