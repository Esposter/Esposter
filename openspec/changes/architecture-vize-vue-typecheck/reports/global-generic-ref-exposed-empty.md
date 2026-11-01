# content-mapper: the template ref of a generic component registered in `GlobalComponents` is typed `{}` in place of its exposed members

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

A generic component is registered in `GlobalComponents`. A template ref to it has the type `{}`, so a call to an exposed method gives TS2339. A component that is not generic works, and `vue-tsc` accepts both.

## Environment

`vize` 0.638.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Nuxt 5.0.0-2611010234-c709ec8, Node 26.13.0, Windows 11. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which checks the same Nuxt app with no error.

## Reproduction

`package.json` and `tsconfig.json` are the ones of the `defineModel` issue, with `include` naming `src/**/*.ts` and `src/**/*.vue`.

`src/Child.vue`:

```vue
<script setup lang="ts" generic="T">
const foo = () => {};

defineExpose({ foo });
</script>

<template>
  <div />
</template>
```

`src/components.d.ts`:

```ts
declare module "vue" {
  export interface GlobalComponents {
    Child: typeof import("./Child.vue").default;
  }
}

export {};
```

`src/Probe.vue`:

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue";

const child = useTemplateRef("child");
child.value?.foo();
</script>

<template>
  <Child ref="child" />
</template>
```

```sh
npm i && npx tsrs --runExternalCode --noEmit -p tsconfig.json
npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

```
src/Probe.vue(5,14): error TS2339: Property 'foo' does not exist on type '{}'.
```

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: `child.value?.nope()` gives TS2339 in both tools, and `vue-tsc` names the type `{ foo: () => void; }`. Removing `generic="T"` from `Child.vue` removes the error.

## Cause

The mapper intersects every global component with a fallback call signature, and the intersection decides the type of the ref.

`$GlobalComponentFallback` is declared in `crates/vize_canon/src/virtual_ts/generator/global_components.rs:242`:

```ts
type $GlobalComponentFallback = (props: Record<string, unknown>, ...args: any[]) => any;
```

It is intersected into the component type at `global_components.rs:296` (`> & $GlobalComponentFallback;`). The ref helper in `generator/setup_helpers.rs:123` reads the exposed type from the last call signature:

```ts
_C extends (props: any, ctx: any, expose: (exposed: infer _E) => any, ...args: any[]) => any ? NonNullable<_E> : any
```

A generic component has no construct signature (`generator/component_constructors/generic_function.rs:1`), so the construct branch of the helper does not apply. The last signature of the intersection is the fallback. Its `...args: any[]` gives `_E` no candidate, so `_E` is `unknown` and `NonNullable<unknown>` is `{}`.

A TypeScript check of the two types outside vize shows this. With `type Ref<_C> = <the helper above>`, `Ref<typeof Generic>` has `foo` and `Ref<typeof Generic & Fallback>` is `{}`, where `Generic` is `<T>(props: { a?: T }, ctx?: any, expose?: (exposed: { foo: () => void }) => void, setup?: any) => any` and `Fallback` is the fallback above.

The fix is likely to leave the fallback out of the intersection for a generic component.

## Real occurrence

The shape in a real Nuxt app: [`Message/Content/Header/CreateDirectMessageParticipantDialog.vue` line 51](https://github.com/Esposter/Esposter/blob/49df4394844218f957290581ab2090a56f7a4f3d/apps/web/app/components/Message/Content/Header/CreateDirectMessageParticipantDialog.vue#L51) calls `friendPicker.value?.reset()` on a ref to [a generic component](https://github.com/Esposter/Esposter/blob/49df4394844218f957290581ab2090a56f7a4f3d/apps/web/app/components/Message/Model/Room/DirectMessage/FriendPicker.vue#L1) that exposes `reset`. `vue-tsc` accepts it.

## Not a duplicate of

Searched open and closed issues and pull requests for global components, template refs and exposed members. The search matches words, not meaning. The nearest are #10210 (merged; accept unresolved global components) and #9797 (merged; generic event payloads of global components). The inputs differ: neither reports the type of a ref.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
