<script setup lang="ts">
import { registerSurveyCreatorPlugin } from "@/services/survey/registerSurveyCreatorPlugin";
import { checkIsServer } from "@esposter/shared";

// The creator renders only once mounted, so its components register on the client alone
if (!checkIsServer()) registerSurveyCreatorPlugin(useNuxtApp().vueApp);

const { creator } = useSurveyCreator();
</script>

<template>
  <UiSkeleton v-if="!creator" h-full min-h-64 />
  <SurveyCreatorComponent v-else :model="creator" />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -- SurveyCreatorComponent renders a Fragment, and Vue passes the scope id onto a child's root element only when it has exactly one — so `scoped` matches nothing here and `:deep()` has no ancestor to anchor to -->
<style>
.svc-creator__banner {
  display: none;
}
</style>
