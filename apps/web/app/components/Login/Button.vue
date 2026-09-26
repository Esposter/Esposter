<script setup lang="ts">
import type { ButtonProps } from "@/components/Login/ButtonProps";

import { authClient } from "@/services/auth/authClient";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useAlertStore } from "@/store/alert";
import { toTitleCase } from "@/util/text/toTitleCase";
import { getResultAsync, noop } from "@esposter/shared";

const { logo, provider } = defineProps<ButtonProps>();
const { signIn } = authClient;
const alertStore = useAlertStore();
const { createAlert } = alertStore;
const isPending = ref(false);
</script>

<template>
  <!-- Every provider draws the same neutral button, as Google's branding guidelines ask of a page offering several:
    None more prominent than another, each told apart by its own full-colour mark -->
  <UiButton
    w-full
    :is-pending
    @click="
      async () => {
        isPending = true;
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
        isPending = false;
      }
    "
  >
    <component :is="logo" v-if="!isPending" size-5 fill-current aria-hidden="true" />
    Continue with {{ toTitleCase(provider) }}
  </UiButton>
</template>
