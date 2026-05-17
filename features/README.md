# Features

Planning and spec documents for Esposter features, refactors, and roadmaps.

---

## Structure

```
features/
  completed/
    <name>.md              ← frozen cross-area record once all items are shipped
  <feature-area>/
    architecture.md        ← optional: key file map, data flows, DB schema (reference)
    <active-roadmap>.md    ← current version roadmap with pending items
    specs/
      <feature-name>.md    ← detailed spec for a planned feature
    completed/
      <name>.md            ← frozen record once all items are shipped
  refactors/
    <name>.md              ← cross-cutting code changes (not user-visible features)
```

### Folders

| Folder                | Purpose                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------- |
| `features/completed/` | Frozen cross-area records that do not belong to one feature area. Do not edit.               |
| `specs/`              | Detailed specs for planned, not-yet-started features. Each file covers one cohesive feature. |
| `<area>/completed/`   | Frozen roadmap or spec files inside a feature area. Move here when every item is shipped.    |
| `refactors/`          | Cross-cutting technical changes (migrations, style enforcement). Not feature-facing.         |

---

## Adding a New Feature

1. **One spec file per feature** — `features/<area>/specs/<feature-name>.md`. Kebab-case names.
2. **Keep specs minimal** — only what a developer needs to implement: overview, data model changes, procedure signatures, component sketch, key file list. No prose filler.
3. **Roadmap version files** — when planning a batch release, create `<vN>.md` at the area root listing items with `[ ]` / `[x]` checkboxes and strikethrough rationale for dropped items.
4. **Mark done** — when every item in a spec or roadmap is shipped, move it to `completed/` with a clean name (drop `(completed)` suffixes).
5. **Architecture files** — `architecture.md` at the area root for AI-assisted development: key file map, data flows, DB schema. Keep it current as the implementation evolves.

---

## Feature Areas

| Area               | Active Roadmap    | Description                                      |
| ------------------ | ----------------- | ------------------------------------------------ |
| `esbabbler/`       | `v5.md`           | Messaging, calls, rooms, moderation, DMs         |
| `fileTableEditor/` | —                 | CSV/JSON/XLSX table editor with computed columns |
| `vue-phaserjs/`    | —                 | Phaser game engine Vue integration               |
| `refactors/`       | `null-removal.md` | Cross-cutting code quality migrations            |
