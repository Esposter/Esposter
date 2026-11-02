# content-mapper: a listener on `<component :is="map[key]">` with `v-if` inside a slot is typed as the DOM `Event`, not as the child's payload

I am replacing the Vue tooling of a Nuxt monorepo with vize, one tool at a time. `vue-tsc` becomes `tsrs` running the vize content mapper. `unplugin-vue` and `@vitejs/plugin-vue` become the vize rolldown and Vite plugins. Nuxt's Vue integration becomes `@vizejs/nuxt`. This issue comes from the first step, the type check, and is one of a few I ran into. A first run of this check on the app reported 103 diagnostics that `vue-tsc` does not report. The twelve issues of the first batch are closed, and a run on `vize` 0.652.0 reports 15. This issue explains some of those 15.

This is one of a batch of issues filed together, all from that attempt:

<batch list filled in when filed>

`<component :is="map[key]" v-if="…" @select="(value) => …" />` inside a named slot types `value` as `Event` and not as the payload of the child's `select` event. `vue-tsc` types it as the payload.

The issue #11367 reported the same symptom for the same element without `v-if`. The input of #11367 fails on 0.638.0 and 0.642.0 and passes on 0.646.0 and later. The element still fails when it has `v-if`, or when the key is a member expression such as `qux.key`.

## Environment

`vize` 0.650.0, `tsrs` 0.20.1-ts7.1.0-beta (`--runExternalCode`), `vue` 3.5.44, Nuxt 5.0.0-2611010234-c709ec8, Linux for the reduction and for the Nuxt app. Oracle: `vue-tsc` 3.3.11 with `typescript` 6.0.3, which checks the same Nuxt app with no error.

## Reproduction

`package.json`:

```json
{
  "private": true,
  "type": "module",
  "devDependencies": {
    "tsrs": "0.20.1-ts7.1.0-beta",
    "typescript": "6.0.3",
    "vize": "0.650.0",
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
  "include": ["src/**/*.vue"]
}
```

`src/Bar.vue`:

```vue
<script setup lang="ts">
const emit = defineEmits<{ select: [value: number] }>();
</script>

<template>
  <button @click="emit('select', 1)" />
</template>
```

`src/Baz.vue`:

```vue
<script setup lang="ts">
defineSlots<{ qux: () => unknown }>();
</script>

<template>
  <slot name="qux" />
</template>
```

`src/Probe.vue`:

```vue
<script setup lang="ts">
import Bar from "./Bar.vue";
import Baz from "./Baz.vue";

const map = { foo: Bar };
const key = "foo";
const isShown = true;
</script>

<template>
  <Baz>
    <template #qux>
      <component :is="map[key]" v-if="isShown" @select="(value) => value.toFixed()" />
    </template>
  </Baz>
</template>
```

```sh
npm i && npx tsrs --runExternalCode --noEmit -p tsconfig.json
npx vue-tsc --noEmit -p tsconfig.json
```

## Actual

The position is in the source, at the handler:

```
src/Probe.vue(13,74): error TS2339: Property 'toFixed' does not exist on type 'Event'.
```

## Expected

No diagnostic, as with `vue-tsc`. `vue-tsc` reads the file: adding `const qux: number = "baz";` to the script gives TS2322 at `src/Probe.vue(8,7)` in both tools.

## Cause

The cause is that the mapper emits no alias for the `:is` expression, so the `select` listener has no component target. The listener then takes the native-element branch, which types it by event name. `select` is a DOM event name, so the result is `Event`. The source is read at the tag `v0.650.0` of `ubugeeei-prod/vize`.

The generated code for the reproduction has no `__vize_dynamic_is_*` line, and the handler is typed by the DOM event:

```ts
    // @select handler
    void ((__vize_event: Event) => {
      // @ts-ignore Inference-only guard; authored v-if checks own diagnostics.
      if ((isShown)) {
        const __vize_handler_9_85 = ((__vize_cb: ((_e: Event) => unknown) | null | undefined) => __vize_cb)(((value) => value.toFixed()));
```

The same file without `v-if` has the alias, and the handler takes the listener type of the child:

```ts
  const __vize_dynamic_is_35 = (map[key]);
  …
      const __vize_handler_9_70: ____vize_dynamic_is_35_9_select_listener | null | undefined = ((value) => value.toFixed());
```

The likely refusal is in `dynamic_component_target` (`crates/vize_croquis/src/drawer/template/visit_element/second_pass.rs:254-258`). Under a slot the root-scope test fails, so the second arm decides:

```rust
((self.in_template_root_scope()
    || (self.current_vif_guard().is_none()
        && !el.props.iter().any(|prop| matches!(prop, PropNode::Directive(dir) if matches!(dir.name, "if" | "else-if" | "else" | "for" | "scope")))
        && self.new_dynamic_alias_is_unbound(el.loc.span.start)
        && self.dynamic_index_has_only_script_values(exp)))
```

That arm fails in two ways. A `v-if`, `v-else-if` or `v-else` on the element, or an active `v-if` guard above it, makes `current_vif_guard().is_none()` or the `any` test false. A key that is not a bare identifier makes `dynamic_index_has_only_script_values` return false (`crates/vize_croquis/src/drawer/template/visit_element/dynamic_component_alias.rs:27-31`):

```rust
let (Expression::Identifier(object), Expression::Identifier(key)) =
    (&member.object, &member.expression)
else {
    return false;
};
```

The alias writer already supports a guard (`crates/vize_canon/src/virtual_ts/scope/dynamic_component.rs:87-95`), so only the admission test refuses. With no alias, the listener type comes from the event name (`crates/vize_canon/src/virtual_ts/scope/event_scope.rs:276`):

```rust
let event_type = get_dom_event_type(data.event_name.as_str());
```

The Isolation table below agrees with this reading for each variant. I did not run a patched mapper.

The fix is likely to admit the alias in a slot when the `:is` expression and the `v-if` guard read only script values. A second change is to accept a member expression as the key.

## Real occurrence

The shape in a real Nuxt app: [`Message/RightSideBar/Search/Input.vue` line 45](https://github.com/Esposter/Esposter/blob/f67c89ea6421ef512da19a49a670746cb4be3b51/apps/web/app/components/Message/RightSideBar/Search/Input.vue#L45) has `:is="SearchFilterComponentMap[activeSelectedFilter.type]"` with `v-if` and `@select` on the same element, inside `<template #panel>`. The handler assigns `value` to a field, so the error there is TS2322 and not TS2339. `vue-tsc` accepts it.

## Isolation

One change at a time from `src/Probe.vue`. Errors on `vize` 0.650.0, `tsrs` and `vue-tsc`:

| Change                                                                              | `tsrs` | `vue-tsc` |
| :---------------------------------------------------------------------------------- | -----: | --------: |
| None                                                                                |      1 |         0 |
| Remove `v-if="isShown"` (the input of #11367)                                       |      0 |         0 |
| `<component>` outside the slot, `v-if` kept                                         |      0 |         0 |
| `:is="map.foo"` (a static chain), `v-if` kept                                       |      0 |         0 |
| Move the `v-if` to a `<template v-if="isShown">` around `<component>`, inside slot  |      1 |         0 |
| Move the `v-if` to `<Baz v-if="isShown">`, outside the slot                         |      1 |         0 |
| `<div v-if="!isShown" />` before it and `v-else` on `<component>`                   |      1 |         0 |
| Remove `v-if`, and use the key `qux.key` with `const qux = { key: "foo" as const }` |      1 |         0 |
| The same member key with `<component>` outside the slot                             |      0 |         0 |

Older versions: the row "Remove `v-if`" gives 1 error on 0.638.0 and 0.642.0 and 0 on 0.646.0, 0.649.0 and 0.651.0. The row "None" gives 1 error on 0.638.0, 0.642.0, 0.646.0, 0.649.0 and 0.651.0.

## Not known

The fix is read from the source and not applied. A guard that reads a slot binding is not checked, and the alias must stay refused for it. Components with `v-for` in a slot are not varied.

## Not a duplicate of

Searched open and closed issues and pull requests for `component :is`, dynamic component, listener, `Event`, `v-if` and slot. The search matches words, not meaning. The nearest are #11367 (closed; the same symptom for the same element without `v-if`, and with a bare key) and #11382 (merged; it admits the alias in a slot for a bare identifier key and no `v-if`). Both leave the inputs above unchanged. Also #10048 (closed; listener inference for a union of dynamic components), which does not cover a missing alias.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
