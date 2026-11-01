# The Normal Form of a Component

Read when a component is being written, reviewed or swept, and when a feature's wiring is about to be added to one that already wires several.

A component is in normal form when nothing in it can be removed, merged or moved without losing something: the way a normalised table has no redundancy left to take out. It is a property of structure, not of size. A short component can be out of form, and a long template of static regions can be in form. The file-length target is only where a pass looks first, because a file far past it almost always has something to remove.

Each property below is a rule another page already owns, stated once as the condition that makes the component minimal.

## One concern

A component does one thing, and a loop's item body that holds its own handler or per-row helper is a component of its own (`vue-page-composition`, the granularity rule). A component holding two concerns is two components.

## One level of abstraction

`<script setup>` declares props and emits, calls the composables that own each concept, and exposes what the template reads. A run of declarations that belong to one concept, or a `computed`, `watch` or function body that implements a sub-concept inline, is a composable (`references/abstraction-levels.md`). A template region that renders one screen or overlay and reads few script names is a sub-component beside the parent, taking props and emitting events.

## No state kept twice

A value derivable from other state is a `computed`, never a second ref held in step by a `watch`; and a `computed` is for work that costs something or an identity that must hold, never for a cheap expression (the `vue` skill, `references/computed-extraction.md`). A `watch` that an event handler or a `computed` could replace is removed.

## Nothing unread

Every name declared in `<script setup>` is read by the script, the template or `defineExpose`, and a `computed` nothing reads is dead weight that still evaluates. `noUnusedLocals` fails the typecheck on one that is not, template reads included; it is set in `packages/configuration/tsconfig.base.json` and restated for the app in `apps/web/configuration/typescript.ts`. A name destructured from a composable and later abandoned is the usual case: delete it from the destructuring, and the composable keeps what it returns only while another caller reads it. The checker does not count a string `ref="name"` as a read, so an element a store owns is bound with a function ref the script names (`:ref="setElement"`, a template expression cannot reach `HTMLDivElement`), and an element the component reads is a `useTemplateRef`.

## Nothing written twice

A repeated expression, handler or region is named once. Extraction must pay: it owns state or a concept the file named only by accident, has a second caller, caches an evaluation, or carries a type the inline form cannot. A long literal lifted into `services/`, or a cheap expression wrapped in a `computed`, has moved code and bought nothing.

## A package's Vue plugin reaches scripts, not templates

A package that builds with the shared Vue plugin has `ref`, `computed`, `unref` and the rest ambient in its scripts and none in its templates. A function a template needs is named in the script and the template binds the name, so the plugin supplies the import and the template needs none:

```ts
const createRenderer = (context: TresRendererSetupContext) => createGenshinRenderer(unref(context.canvas));
```

## An integration root

A component that wires many features (the world session is one) is in normal form when each feature is one composable call and one sub-component tag, and nothing else of the feature lives in it. It is the file that gains a line with every feature, so the form is what keeps it from growing logic: a feature added to it is a call and a tag, never an inline body.

That form has a size limit, because a call and a tag are not free: a root that has grown to a thousand lines of them has outgrown the form whatever each line is, and a pass that blesses it as "an integration root" has read the shape and not the file. Such a root is cut by role. Related features' calls move into one composable of their own, and the template's layers (the overlays, the menus, the feature screens) become sub-components that take props, never `provide`/`inject`, which leaves the signature (the `vue` skill). Two features that need each other's results stay together in one composable, since splitting them only moves the forward reference. A single-file component several times past the file-length target (the `file-organization` skill, "File Length") is read for the same cut before it is dated, and its script is never excused by the template's length: its regions, its list item bodies and the clusters of state that serve one region each want a piece of their own.

In a package whose components are each shot alone, a sub-component is a nested folder under its parent (`CharacterMenu/Artifacts/Index.vue`), which the visual suite treats as a piece of the parent drawn only inside it, so it takes no fixture, image or reference of its own (`packages/genshin-interface/src/components/components.visual.ts`).
