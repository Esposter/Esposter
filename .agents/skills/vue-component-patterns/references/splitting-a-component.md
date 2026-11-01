# Splitting an Oversized Component

Read when a `.vue` is several times past the file-length target and is about to be cut, by a session or by a delegated agent. What a component in normal form is, and why a long integration root is not exempt, is `references/normal-form.md`; this page is how one cut is made.

## The cut

The goal is a root `Index.vue` that reads as a bill of materials: its `<script setup>` declares props and emits, calls a few composables, and its template mounts children. Each cut is decided by role, in this order:

1. **A distinct panel, region or screen state of the template** (a header, a list pane, a detail pane, a tab body, a dialog) becomes a child component.
2. **A `v-for` item body** becomes a child that takes the item as a prop.
3. **A cluster of refs, computeds and handlers serving one region** moves with that region into the child, or into a composable when two regions share it. Pure helpers and constants move to the package's `services/`, one export per file.
4. **Props go down and events go up** (`defineEmits`, or `defineModel` for a two-way value). A child that needs many props usually means the state belongs inside it, or the cut runs along the wrong line. The exception is a layer of an integration root, whose overlays and screens legitimately read many values the root's composables return; those take as many props as their block reads, never `provide`/`inject`.

## Where the pieces live

- A component is a folder holding `Index.vue`. A child drawn only inside its parent is a nested folder, `<Parent>/<Child>/Index.vue`, named for its role and never repeating the parent's name. In `genshin-interface` and `genshin-world` a nested folder is a piece of its parent and takes no `Index.fixture.ts`, image, `Index.reference.ts` or browser test of its own (`normal-form.md`, "An integration root"). In `apps/web` the folder-path prefix naming is `references/component-naming.md`.
- Composables go in the package's composables folder (`packages/genshin-world/src/composables/`); `genshin-interface` has none, so a shared `use…` file sits in `services/` beside its topic. No new top-level folders.
- The parent's props, emits, exposed API, fixture, images, reference file and browser tests are left as they are.

## Behaviour does not change

A Genshin screen is compared pixel by pixel against reference images, so the rendered DOM, classes, inline styles and attributes are identical after the cut. A child's root is the element it replaces, with no wrapper added, and a `<style scoped>` rule that reaches into a moved part moves with it, unchanged. A defect seen on the way is reported and left. The typecheck of the package is the check that a cut kept its names and types, and runs from the main checkout, since a worktree has no built `dist`.

## Dating the ledger

A row of the `vue-components` ledger lists several directories, so a pass dates it only once every file in it that is past the target has been cut. The commit that completes the row carries the `Ledger: vue-components | <unit>` trailer, never a cut that finished one file of several.
