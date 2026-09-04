<script setup lang="ts">
import type { ButtonProps } from "@/components/Login/ButtonProps";
import type { betterAuth } from "better-auth";
import type { CSSProperties } from "vue";

import { authClient } from "@/services/auth/authClient";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useAlertStore } from "@/store/alert";
import { toTitleCase } from "@/util/text/toTitleCase";
import { getResultAsync, noop } from "@esposter/shared";

const { logo, logoAttrs, logoStyle, provider, style } = defineProps<ButtonProps>();
const { signIn } = authClient;
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const isLoading = ref(false);
</script>

<template>
  <button
    :style
    shadow="[0_0.125rem_0.25rem_0_rgba(0,0,0,0.25)]"
    hover:shadow="[0_0.125rem_0.625rem_0.125rem_rgba(0,0,0,0.35)]"
    pl-2
    rd
    flex
    h-12
    w-full
    transition="[box-shadow,transform]"
    duration-.2s
    items-center
    hover:translate-y="[-0.1875rem]"
    :disabled="isLoading"
    @click="
      async () => {
        isLoading = true;
        // `onError` is the auth client's own report of a refused sign-in; a rejection here is the redirect
        // Never starting at all, which nothing else would say — and the spinner has to clear on both paths
        await getResultAsync(() =>
          signIn.social(
            { provider },
            {
              onError: ({ error }) => {
                createAlert(error.message, 'error');
              },
            },
          ),
        ).match(noop, createErrorAlert);
        isLoading = false;
      }
    "
  >
    <component :is="logo" :style="{ ...logoStyle }" w-8 :="{ ...logoAttrs }" />
    <div flex size-full items-center justify-center>
      <v-progress-circular v-if="isLoading" color="white" size="small" indeterminate />
      <span v-else text-white font-bold>{{ toTitleCase(provider) }}</span>
    </div>
  </button>
</template>
