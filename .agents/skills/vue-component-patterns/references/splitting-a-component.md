# Splitting an Oversized Component

Read when a `.vue` is several times past the file-length target and is about to be cut, by a session or by a delegated agent. What a component in normal form is, and why a long integration root is not exempt, is `references/normal-form.md`; this page is how one cut is made.

## The cut

The goal is a root `Index.vue` that reads as a bill of materials: its `<script setup>` declares props and emits, calls a few composables, and its template mounts children. Each cut is decided by role, in this order:

1. **A distinct panel, region or screen state of the template** (a header, a list pane, a detail pane, a tab body, a dialog) becomes a child component.
2. **A `v-for` item body** becomes a child that takes the item as a prop.
3. **A cluster of refs, computeds and handlers serving one region** moves with that region into the child, or into a composable when two regions share it. Pure helpers and constants move to the package's `services/`, one export per file.
4. **Props go down and events go up** (`defineEmits`, or `defineModel` for a two-way value). A child that needs many props usually means the state belongs inside it, or the cut runs along the wrong line. The exception is a layer of an integration root, whose overlays and screens legitimately read many values the root's composables return; those take as many props as their block reads, never `provide`/`inject`.

## A group cut of an integration root is judged by what it adds

A root cut into group composables moves its calls and also the dependency list each call read: the new composable takes
one options object that restates, with types, every value the moved calls took from above, and returns every name the
root and the template read below. When a group's options list is long, the cut moves the root's weight into an option
interface and a return list, and the package grows. Measured on the Genshin session root (`packages/genshin-world/src/components/World/Session/Index.vue`,
about 1,300 script lines of calls to sixty composables), five cuts by feature each took 9 to 35 lines out of the root and put 117 to 222
net lines into the package, with 10 to 28 options each: 640 net lines added to take under 100 out. They were not taken.

So a cut is made in this order, and each step is judged by the lines it leaves behind:

1. **Bundle what the calls repeat.** The members one call after another lists (the bag, the wallet and their setters, the
   item data and names) are one typed object declared once (`WorldBagDependencies`) and spread into the calls whose option
   types declare it whole, which took 47 lines out of the session root and added none.
2. **Cut a group only when it has fewer inputs than statements.** A group with a short options list (a handful of values)
   and a name that says one feature is a composable; a group whose list runs to twenty values is the root's wiring under
   another name. The root that stays long because of its arguments is the integration root the form allows, and it is
   dated with that reading.
3. **A root's size is not cut by moving a call**; a call is moved when its state and its handlers move with it.

## A cut never bends to the checker

A cut is decided by role, in the order above, and by nothing the typecheck tolerates. A layer is never split, merged, renamed or thinned so that a tool passes it, and a rule that counts something the checker happens to limit is not written. When the right cut makes the checker fail, the checker is what is wrong: the gap is drafted as an upstream report (the `todos` skill, `references/upstream-reports.md`), and the code keeps the working shape under an `@TODO` that the fix deletes. The measure holds the other way too. A cut the checker rejects is still judged on what it adds and removes, so a failing build is no reason to want the cut back. The session root's menu layer shows both: a forwarding child for it failed the checker, which then lost a component's earliest events from its event map once the component declared more than sixteen (a defect since fixed upstream), and measured on the real file it also adds more lines than it removes, which alone keeps it out. The same measure applies to every limit: a cut is not made to get under a file-length target, an event count or a prop count, and a limit that a cut would have to bend the code to meet is the limit to change. The layer stays in the root, and `openspec/rejected/genshin/session-menu-layer/design.md` holds the measurements and the recorded child.

## Where the pieces live

- A component is a folder holding `Index.vue`. A child drawn only inside its parent is a nested folder, `<Parent>/<Child>/Index.vue`, named for its role and never repeating the parent's name. In `genshin-interface` and `genshin-world` a nested folder is a piece of its parent and takes no `Index.fixture.ts`, image, `Index.reference.ts` or browser test of its own (`normal-form.md`, "An integration root"). In `apps/web` the folder-path prefix naming is `references/component-naming.md`.
- Composables go in the package's composables folder (`packages/genshin-world/src/composables/`); `genshin-interface` has none, so a shared `use…` file sits in `services/` beside its topic. No new top-level folders.
- The parent's props, emits, exposed API, fixture, images, reference file and browser tests are left as they are.

## Behaviour does not change

A Genshin screen is compared pixel by pixel against reference images, so the rendered DOM, classes, inline styles and attributes are identical after the cut. A child's root is the element it replaces, with no wrapper added, and a `<style scoped>` rule that reaches into a moved part moves with it, unchanged. A defect seen on the way is reported and left. The typecheck of the package is the check that a cut kept its names and types, and runs from the main checkout, since a worktree has no built `dist`.

## Dating the ledger

A row of the `vue-components` ledger lists several directories, so a pass dates it only once every file in it that is past the target has been cut. The commit that completes the row carries the `Ledger: vue-components | <unit>` trailer, never a cut that finished one file of several.
