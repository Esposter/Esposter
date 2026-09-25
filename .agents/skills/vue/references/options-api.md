# The Options API Runtime Is Compiled Out

Read before adding a dependency that ships `.vue` components, or when a component inside `node_modules` renders blank or throws off an undefined property.

Our own components are `<script setup>` only, enforced by `vue/component-api-style` — that half needs no prose. This page is about the half a linter cannot reach: a dependency's compiled components.

`future.compatibilityVersion: 5` defaults `vue.optionsApi` to **off**, and nothing in the repo turns it back on. Turning it on is a whole-app cost paid for one dependency, so a component library that needs it is a library to replace rather than a flag to flip — and replacing it has meant writing the few components we actually used ourselves, not swapping in the next wrapper.

## The failure mode

Without Vue's options applier an Options API component still mounts, `$data` stays `{}`, and its compiled render dereferences a property off `undefined` with **nothing thrown beforehand** to name the cause.

It survives typecheck and lint, so the test run is what catches it. Node resolves `vue` to its CommonJS build, which has the Options API compiled in whatever the flag says, so every Vitest worker loads `@esposter/configuration/vitest/registerVueEsmBundler.js` first (`getVueTestConfiguration`, spread by `getVitestConfiguration` and by the app's config). It sends every Vue runtime entry to the esm-bundler build and sets the flag off, so a component test mounting an Options API dependency fails the way the app does. **Never run a member's tests without it**: a config that stops spreading it lets a component pass here and throw in the app. It reaches Vue Test Utils too: `global.mocks` is applied as a mixin, which this Vue refuses with a warning on every `mountSuspended` (Nuxt always passes mocks), so a mock never reaches the component. Stub what a test needs another way, and never assert that `console.warn` went uncalled — filter for the warning the test is about.

JSON Forms' Vue components are the case the tree holds: its `JsonForms` root, `DispatchRenderer` and every vanilla renderer are Options API, so the schema form keeps the engine and renders through a Vue shell of the library's own (`apps/web/content/docs/architecture/schema-forms.md`).
