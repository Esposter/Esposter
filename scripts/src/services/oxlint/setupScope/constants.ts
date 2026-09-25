export const MESSAGE =
  "Call `useMutation()` in a setup scope — a store's setup callback, a component's `<script setup>` or a `use*` composable — and key the one instance per target. Called inside an action or a callback it creates a detached effect scope every call leaks. See /docs/architecture/client-data.";
// Vue's own composable convention: a function named `use` and a capital runs where setup does
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const COMPOSABLE_NAME_REGEX: RegExp = /^use[A-Z]/u;
// The framework calls whose callback is a setup: Pinia's store setup and Nuxt's plugin setup, each run once
export const SETUP_CALLEE_NAMES: string[] = ["defineNuxtPlugin", "defineStore"];
