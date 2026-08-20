# The Options API Runtime Is Compiled Out

Read before adding a dependency that ships `.vue` components, or when a component inside `node_modules` renders blank or throws off an undefined property.

`future.compatibilityVersion: 5` defaults `vue.optionsApi` to **off**, and nothing in the repo turns it back on. Turning it on is a whole-app cost paid for one dependency, so a component library that needs it is a library to replace rather than a flag to flip.

## The failure mode

Without `applyOptions` an Options API component still mounts, `$data` stays `{}`, and its compiled render dereferences a property off `undefined` with **nothing thrown beforehand** to name the cause.

It survives typecheck and lint, and which Vite run compiles the component decides whether it survives Vitest: a package testing through the shared `getVuePlugins()` compiles with `@vitejs/plugin-vue`'s own default, where the Options API is on, so a component test there can pass while the app is broken. A render error inside a `node_modules` component is worth checking `/_nuxt/@vite/env` for (`run-app`) before reading its source.
