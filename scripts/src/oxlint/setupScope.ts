import type { Plugin } from "@oxlint/plugins";

import { noDetachedMutation } from "#src/services/oxlint/setupScope/noDetachedMutation";
import { definePlugin } from "@oxlint/plugins";

// An oxlint JS plugin enforcing `apps/web/content/docs/architecture/client-data.md`'s rule that `useMutation()` is
// Called in a setup scope and never inside an action to fake isolation: every call creates an effect scope, and one
// Created per action is detached from the store or component that would dispose it, so it leaks. The pinia skill's
// Mutation-actions page states the store half.
//
// It reads the nearest function around the call. A setup scope is named by vocabularies the repo does not own —
// Vue's `use*` composable convention, Pinia's `defineStore` and Nuxt's `defineNuxtPlugin` setup callbacks, and a
// Component's `<script setup>` top level, which is outside every function — and the call it reads is the one
// Primitive the rule is about.
const plugin: Plugin = definePlugin({
  meta: { name: "setup-scope" },
  rules: { "no-detached-mutation": noDetachedMutation },
});

export default plugin;
