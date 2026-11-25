# Template Gotchas

Read when a directive or slot renders nothing, when the type check reports a template identifier it should be able to see, or when a guarded value goes `possibly undefined` inside an inline handler. Some template forms compile and are still wrong — rendering nothing while typechecking cleanly, or losing a guard's narrowing at a closure — and a cast on a type-only import is right all along, though the checker's error names it in place of the value usage that caused it.

## `v-html` only on a plain element

On a component (`<UiAlert v-html="html" />`) it compiles to an `innerHTML` prop that the component's own children patch drops, so the element renders empty in SSR and on the client with no warning.

Wrap instead: `<UiAlert><div class="rich-text-content" v-html="html" /></UiAlert>`.

**What may be bound is settled before the template, never in it.** `v-html` writes its string into the DOM as
markup, so the binding is safe exactly when the value arrived through a boundary that sanitizes — the schema
that parses it or the service that builds it. A value that reaches a component without passing one of those has
no business being bound here at all, and the fix is the boundary, not a second sanitize at the call site:
sanitizing again in the template says the boundary is not trusted, and leaves two places to keep in step.

## Dotted slot names need dynamic binding

Vue rejects dots in static slot names, so a slot named with one is written in brackets: ``#[`item.drag`]``. Only dot-free names are static (`#top`).

## A comment inside a `<Transition>` slot breaks hydration in development

A template comment is a node. The server renders it, but the client's transition slot drops it in a development build, so hydration meets the comment where it expects the slot's element and reports a mismatch. Production strips comments on both sides, which is why a deployed check stays clean while a development page fails. Put a comment that explains a transition's child outside the transition's tag, directly above it:

```vue
<template>
  <!-- WRONG — the comment is the transition's first child -->
  <TransitionFade mode="out-in">
    <!-- A drawing left keeps its calculator -->
    <KeepAlive>
      <component :is="drawing" />
    </KeepAlive>
  </TransitionFade>

  <!-- CORRECT — the note sits outside the slot -->
  <!-- A drawing left keeps its calculator -->
  <TransitionFade mode="out-in">
    <KeepAlive>
      <component :is="drawing" />
    </KeepAlive>
  </TransitionFade>
</template>
```

The cause and its one case are recorded in `openspec/specs/architecture/hydration/design.md`.

## A guard in an inline handler does not narrow inside a closure

A template identifier resolving to the **render context** compiles to a property access on it, and a property
access is not narrowed across a function boundary. Bindings declared inside the handler — `itemId` below —
are ordinary locals and narrow as usual; the rule is about the render-context ones. So a
`v-if`, or a guard clause at the top of the handler, holds for the handler's own statements and is lost the
moment a nested closure reads the same render-context property:

```vue
<template>
  <!-- WRONG — TS18048 `__VLS_ctx.item` is possibly 'undefined' -->
  <UiButton
    @click="
      async () => {
        if (!item) return;
        await getResultAsync(() => deleteItem(item.id)).match(noop, console.error);
      }
    "
  />
  <!-- CORRECT — read the property out under the guard, pass the local into the closure -->
  <UiButton
    @click="
      async () => {
        if (!item) return;

        const itemId = item.id;
        await getResultAsync(() => deleteItem(itemId)).match(noop, console.error);
      }
    "
  />
</template>
```

This local is **not** the single-use intermediate the `typescript` skill bans (`references/loops.md`) — it is the narrowing, and
deleting it fails typecheck. Keep it, with a one-line comment saying why: inlining the property read back into
the closure recreates `TS18048`. The shape recurs wherever a handler reads a render-context value inside a
nested closure.

## `import type` names ARE visible in template casts

`$event as FooType` works on a type-only import; never widen it to a value import for the cast's sake. Only a template _value_ usage (value-set member access, a `v-for` source, a call) needs one.

When the type check reports TS2551 `Property 'X' does not exist on type '{ …ctx… }'` on a template identifier, the culprit is a value usage elsewhere in the template, not the cast.
