<script setup lang="ts">
import type { NuxtError } from "#app";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { DEFAULT_ERROR_STATUS_CODE } from "@/services/app/constants";
import { RoutePath } from "@esposter/shared";

interface Props {
  error: NuxtError;
}

const { error } = defineProps<Props>();
const { currentRoute } = useRouter();
const isNotFound = computed(() => error.statusCode === 404);
const title = computed(() => (isNotFound.value ? "Page not found" : "Something went wrong"));
// Nuxt replaces a server error's own message with a generic one in production, so this is safe to render as-is
const description = computed(() =>
  isNotFound.value
    ? "Nothing lives at this address. It may have moved, or it was never here."
    : error.statusMessage || "The page could not be loaded. Trying again often works.",
);
</script>

<template>
  <!-- Nuxt renders this in place of App.vue, for a route nothing matches as much as for a failure, so the dock is not
    Here and the way home is the page's own -->
  <NuxtTheme>
    <main text-text bg-background flex items-center justify-center min-h-dvh>
      <AppStatusScene
        :description
        :is-missing-block="isNotFound || undefined"
        :status-code="error.statusCode ?? DEFAULT_ERROR_STATUS_CODE"
        :title
      >
        <UiButton
          v-if="!isNotFound"
          :variant="UiButtonVariant.Accent"
          px-4
          py-1
          @click="clearError({ redirect: currentRoute.fullPath })"
        >
          Try again
        </UiButton>
        <UiButton
          :variant="isNotFound ? UiButtonVariant.Accent : undefined"
          px-4
          py-1
          @click="clearError({ redirect: RoutePath.Index })"
        >
          Go home
        </UiButton>
      </AppStatusScene>
    </main>
  </NuxtTheme>
</template>
