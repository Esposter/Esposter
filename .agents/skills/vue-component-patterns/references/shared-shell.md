# The shared shell

Read when a page needs chrome — a header, an empty state, a loading region, a search palette, a breadcrumb trail — or when a new product or editor is added. The rule that cross-product chrome is a shared component in `components/Ui/` or `components/App/`, never rebuilt per product, is in `SKILL.md`; this page is what each primitive is for and what a new product wires up.

Cross-product chrome is a small set of shared components in `components/Ui/` (the UI library) and `components/App/` (app-chrome) — **reuse them, never re-roll a bare `v-toolbar` per editor.** Their design and rationale live in `apps/web/content/docs/resource/shell-cohesion.md`; keep that spec live in the same change when you add or alter a shell primitive.

- The `resource` layout's header — its rows and slots are `shell-cohesion.md`. **One per route** — it renders `AppBreadcrumbs` itself, so a second one nested under a page that already has one renders a second trail and a second meter. A toolbar _inside_ a page — a blade's own tools, a card header — is a plain row of its own.
- `UiEmptyState` for an empty list or state, and `UiErrorState` for a failed read, which brings its own retry button — the slots both share are `shell-cohesion.md`'s.
- `UiSkeleton` — a decorative block the caller sizes (`<UiSkeleton h-16 />`), standing in for per-region loading. **A component whose parent already renders it as a `<Suspense>` fallback `await`s the data its first render needs in setup**, rather than keeping its own `isLoading` ref and skeleton branch — that is two indicators for one wait, one of them dead. Only data gating the _initial_ render belongs in setup: a value that fills in a detail later is read in `onMounted` and `v-if`ed until it arrives. Own the flag where nothing suspends the component, or where the template guards on something an imperative library builds in `onMounted`.
- `AppBreadcrumbs` — the trail of pages the visitor came through, rendered by the page header through `UiBreadcrumbs`.

When a new product/editor is added, give its **page** the page header, a launcher entry in its group of `ProductGroups`, and — if it is resource-backed — an entry in `ResourceDefinitionMap` (`shared/services/resource/`), the single map carrying each resource type's `icon`, `title`, and route for the `/resources` hub. Document the result in the shell-cohesion spec.
