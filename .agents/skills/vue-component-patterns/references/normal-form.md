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

Every name declared in `<script setup>` is read by the script, the template or `defineExpose`, and a `computed` nothing reads is dead weight that still evaluates. Nothing lints it, so a script collects them: usually names destructured from a composable and later abandoned. Delete the name from the destructuring; the composable keeps what it returns only while another caller reads it. The scan is in the Vue components ledger.

## Nothing written twice

A repeated expression, handler or region is named once. Extraction must pay: it owns state or a concept the file named only by accident, has a second caller, caches an evaluation, or carries a type the inline form cannot. A long literal lifted into `services/`, or a cheap expression wrapped in a `computed`, has moved code and bought nothing.

## A package's Vue plugin reaches scripts, not templates

A package that builds with the shared Vue plugin has `ref`, `computed`, `unref` and the rest ambient in its scripts and none in its templates. A function a template needs is named in the script and the template binds the name, so the plugin supplies the import and the template needs none:

```ts
const createRenderer = (context: TresRendererSetupContext) => createGenshinRenderer(unref(context.canvas));
```

## An integration root

A component that wires many features (the world session is one) is in normal form when each feature is one composable call and one sub-component tag, and nothing else of the feature lives in it. It is the file that gains a line with every feature, so the form is what keeps it from growing logic: a feature added to it is a call and a tag, never an inline body.
