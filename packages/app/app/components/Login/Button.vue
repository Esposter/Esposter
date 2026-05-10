<script setup lang="ts">
import type { betterAuth } from "better-auth";
import type { CSSProperties } from "vue";

import { authClient } from "@/services/auth/authClient";
import { useAlertStore } from "@/store/alert";
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
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const isLoading = ref(false);
</script>

<template>
  <button
    :style
    shadow="[0_2px_4px_0_rgba(0,0,0,0.25)]"
    hover:shadow="[0_2px_10px_2px_rgba(0,0,0,0.35)]"
    transition="[box-shadow_0.2s,transform_0.2s]"
    hover:-translate-y-[3px]
    h-12
    w-full
    flex
    items-center
    rd
    mb-3
    pl-2
    :disabled="isLoading"
    @click="
      async () => {
        isLoading = true;
        await signIn.social(
          { provider },
          {
            onError: ({ error }) => {
              createAlert(error.message, 'error');
            },
          },
        );
        isLoading = false;
      }
    "
  >
    <component :is="logo" :style="{ ...logoStyle }" w-8 :="{ ...logoAttrs }" />
    <div size-full flex items-center justify-center>
      <v-progress-circular v-if="isLoading" color="white" size="small" indeterminate />
      <span v-else font-bold text-white>{{ toTitleCase(provider) }}</span>
    </div>
  </button>
</template>
