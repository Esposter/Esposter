# Template Gotchas

Four template forms that compile and are still wrong — two that render nothing while typechecking cleanly, and two where vue-tsc's error points somewhere other than its cause. Read when a directive or slot renders nothing, when vue-tsc reports a template identifier it should be able to see, or when a guarded value goes `possibly undefined` inside an inline handler.

## `v-html` only on a plain element

On a component (`<v-card-text v-html="html" />`) it compiles to an `innerHTML` prop that the component's own children patch drops, so the element renders empty in SSR and on the client with no warning.

Wrap instead: `<v-card-text><div class="rich-text-content" v-html="html" /></v-card-text>`.

**What may be bound is settled before the template, never in it.** `v-html` writes its string into the DOM as
markup, so the binding is safe exactly when the value arrived through a boundary that sanitizes — the schema
that parses it or the service that builds it. A value that reaches a component without passing one of those has
no business being bound here at all, and the fix is the boundary, not a second sanitize at the call site:
sanitizing again in the template says the boundary is not trusted, and leaves two places to keep in step.

## Dotted slot names need dynamic binding

Vue rejects dots in static slot names; Vuetify item slots use brackets: ``#[`item.drag`]``. Only dot-free names are static (`#top`, `#activator`). `#activator` ordering is the `vuetify` skill's.

## A guard in an inline handler does not narrow inside a closure

A template identifier resolving to the **render context** compiles to a property access on it, and a property
access is not narrowed across a function boundary. Bindings declared inside the handler — `onComplete` and
`itemId` below — are ordinary locals and narrow as usual; the rule is about the render-context ones. So a
`v-if`, or a guard clause at the top of the handler, holds for the handler's own statements and is lost the
moment a nested closure reads the same render-context property:

```vue
<template>
  <!-- WRONG — TS18048 `__VLS_ctx.item` is possibly 'undefined' -->
  <StyledDeleteFormDialog
    @delete="
      async (onComplete) => {
        if (!item) return;
        await withFinalizerAsync(() => deleteItem(item.id), onComplete);
      }
    "
  />
  <!-- CORRECT — read the property out under the guard, pass the local into the closure -->
  <StyledDeleteFormDialog
    @delete="
      async (onComplete) => {
        if (!item) return;

        const itemId = item.id;
        await withFinalizerAsync(() => deleteItem(itemId), onComplete);
      }
    "
  />
</template>
```

This local is **not** the redundant destructure the `typescript` and `vue` skills ban — it is the narrowing, and
deleting it fails typecheck. Keep it, with a one-line comment saying why: inlining the property read back into
the closure recreates `TS18048`. The shape recurs in every `StyledDeleteFormDialog` whose delete runs inside
`withFinalizerAsync`.

## `import type` names ARE visible in template casts

`$event as FooType` works on a type-only import; never widen it to a value import for the cast's sake. Only a template _value_ usage (enum member access, a `v-for` source, a call) needs one.

When vue-tsc reports TS2551 `Property 'X' does not exist on type '{ …ctx… }'` on a template identifier, the culprit is a value usage elsewhere in the template, not the cast.
