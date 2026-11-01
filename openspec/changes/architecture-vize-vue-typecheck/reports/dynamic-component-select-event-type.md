# content-mapper: a listener on `<component :is="map[key]">` inside a slot is typed as the DOM `Event` when its name is also a DOM event name

I was trying to adopt vize for Nuxt type checking and ran into this, among a few others.

`<component :is="map[key]" @select="(value) => …">` inside a named slot types `value` as `Event` and not as the child's emitted payload. `vue-tsc` types it as the payload.

## Environment

`vize` 0.638.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Nuxt 5.0.0-2611010234-c709ec8, Node 26.13.0, Windows 11. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which checks the same Nuxt app with no error.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "devDependencies": {
    "tsrs": "0.20.1-ts7.1.0-beta",
    "typescript": "6.0.3",
    "vize": "0.638.0",
    "vue": "3.5.44",
    "vue-tsc": "3.3.11"
  }
}
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "noEmit": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ESNext"
  },
  "contentMappers": [{ "package": "vize", "extensions": [".vue"] }],
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

`src/Child.vue`:

```vue
<script setup lang="ts">
const emit = defineEmits<{ select: [value: number] }>();
</script>

<template>
  <button @click="emit('select', 1)" />
</template>
```

`src/Panel.vue`:

```vue
<script setup lang="ts">
defineSlots<{ foo: (props: { bar: number }) => unknown }>();
</script>

<template>
  <slot name="foo" :bar="1" />
</template>
```

`src/Probe.vue`:

```vue
<script setup lang="ts">
import Child from "./Child.vue";
import Panel from "./Panel.vue";

const map = { foo: Child };
const key = "foo";
</script>

<template>
  <Panel>
    <template #foo>
      <component :is="map[key]" @select="(value) => value.toFixed()" />
    </template>
  </Panel>
</template>
```

```sh
npm i && npx tsrs --runExternalCode --noEmit -p tsconfig.json
npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

```
src/Probe.vue(12,59): error TS2339: Property 'toFixed' does not exist on type 'Event'.
```

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: `value.nope()` in place of `value.toFixed()` gives TS2339 in both tools, on type `number`, when the `<component>` is outside the slot.

## Cause

The mapper gives a computed `:is` no component target inside a slot. The listener then takes the native-element branch, which types it by event name.

The alias for a computed `:is` expression exists only at the template root. Under a `v-slot` scope the mapper refuses it (`crates/vize_croquis/src/drawer/template/visit_element/dynamic_component_alias.rs:22`):

```rust
| ScopeKind::VSlot
```

and `second_pass.rs:245` requires the root scope:

```rust
(self.in_template_root_scope()
```

With no target, the listener is typed by its name (`crates/vize_canon/src/virtual_ts/scope/event_scope.rs:276`):

```rust
let event_type = get_dom_event_type(data.event_name.as_str());
```

`select` is a DOM event name, so the result is `Event`. A name that is not a DOM event, such as `pick`, gets `any`.

The fix is likely to allow the alias inside a slot when the `:is` expression reads no slot binding, and to emit it inside the slot closure.

## Real occurrence

The shape in a real Nuxt app: [`Message/RightSideBar/Search/Input.vue` lines 43 to 52](https://github.com/Esposter/Esposter/blob/49df4394844218f957290581ab2090a56f7a4f3d/apps/web/app/components/Message/RightSideBar/Search/Input.vue#L43-L52) has `<component :is="SearchFilterComponentMap[…]">` with `@select` inside `<template #panel>`. `vue-tsc` types the handler value as the payload.

## Isolation

One change at a time from `src/Probe.vue`. Results on `vize` 0.638.0 with `tsrs`:

| Change                           | Result        |
| :------------------------------- | :------------ |
| None                             | `Event` error |
| `<component>` outside the slot   | no error      |
| `:is="map.foo"` (a static chain) | no error      |
| `@pick` in place of `@select`    | no error      |

## Not a duplicate of

Searched open and closed issues and pull requests for dynamic components, listeners and `Event`. The search matches words, not meaning. The nearest are #2915 (merged; DOM-event fallback for a static member chain) and #2630 (merged; kebab-case dynamic events). Neither names a computed expression inside a slot.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
