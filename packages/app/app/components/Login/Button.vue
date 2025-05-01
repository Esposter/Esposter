<script setup lang="ts">
import type { betterAuth } from "better-auth";
import type { Component, CSSProperties } from "vue";

import { authClient } from "@/services/auth/authClient";
import { toTitleCase } from "@/util/text/toTitleCase";

export interface LoginButtonProps {
  logo: Component;
  logoAttrs?: Record<string, unknown>;
  logoStyle?: CSSProperties;
  provider: keyof NonNullable<Parameters<typeof betterAuth>[0]["socialProviders"]>;
  style?: CSSProperties;
}

const { logo, logoAttrs, logoStyle, provider, style } = defineProps<LoginButtonProps>();
const { signIn } = authClient;
const isLoading = ref(false);
</script>

<template>
  <button
    class="button"
    :style
    pl-2
    flex
    items-center
    w-full
    rd
    mb-3
    h-12
    @disabled="isLoading"
    @click="
      async () => {
        isLoading = true;
        await signIn.social(
          { provider },
          {
            onError: ({ error }) => {
              useToast(error.message, { cardProps: { color: 'error' } });
            },
          },
        );
        isLoading = false;
      }
    "
  >
    <component :is="logo" :style="{ ...logoStyle }" w-8 :="{ ...logoAttrs }" />
    <div size-full flex justify-center items-center>
      <v-progress-circular v-if="isLoading" color="white" size="small" indeterminate />
      <span v-else font-bold text-white>{{ toTitleCase(provider) }}</span>
    </div>
  </button>
</template>

<style scoped lang="scss">
.button {
  box-shadow: 0 2px 4px 0 rgba(black, 0.25);
  transition:
    box-shadow 0.2s,
    transform 0.2s;

  &:hover {
    box-shadow: 0 2px 10px 2px rgba(black, 0.35);
    transform: translateY(-3px);
  }
}
</style>
