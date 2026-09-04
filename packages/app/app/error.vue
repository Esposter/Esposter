<script setup lang="ts">
import type { NuxtError } from "#app";

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
    ? "The page you asked for does not exist, or it moved somewhere else."
    : error.statusMessage || "The page could not be loaded. Trying again often works.",
);
</script>

<template>
  <!-- Nuxt renders this in place of app.vue, so the chrome every other surface inherits is not here: the shell is
  what a Vuetify component needs to render at all, rather than a layout choice -->
  <v-app>
    <div flex h-screen items-center justify-center>
      <StyledEmptyState :description :icon="isNotFound ? 'mdi-map-marker-question' : 'mdi-alert-octagon'" :title>
        <div flex flex-wrap gap-3 justify-center>
          <StyledButton
            :button-props="{ prependIcon: 'mdi-home' }"
            @click="
              async () => {
                await clearError({ redirect: RoutePath.Index });
              }
            "
          >
            Go home
          </StyledButton>
          <v-btn
            v-if="!isNotFound"
            prepend-icon="mdi-refresh"
            variant="tonal"
            @click="
              async () => {
                await clearError({ redirect: currentRoute.fullPath });
              }
            "
          >
            Try again
          </v-btn>
        </div>
      </StyledEmptyState>
    </div>
  </v-app>
</template>
