<script setup lang="ts">
import type { LoginButtonProps } from "@/components/Login/Button.vue";

import { SITE_NAME } from "@esposter/shared";

definePageMeta({ middleware: "guest" });

const loginButtonsProps = ref<LoginButtonProps[]>([
  {
    logo: markRaw(defineAsyncComponent(() => import(`@/components/Visual/Logo/Google.vue`))),
    logoStyle: {
      backgroundColor: "#fff",
      borderRadius: "4px 0 0 4px",
      height: "3rem",
      padding: ".625rem",
      width: "3rem",
    },
    provider: "google",
    style: { backgroundColor: "#4285f4", paddingLeft: "0" },
  },
  {
    logo: markRaw(defineAsyncComponent(() => import(`@/components/Visual/Logo/Github.vue`))),
    logoAttrs: { fill: "#fff" },
    provider: "github",
    style: { backgroundColor: "#252525" },
  },
  {
    logo: markRaw(defineAsyncComponent(() => import(`@/components/Visual/Logo/Facebook.vue`))),
    provider: "facebook",
    style: { backgroundColor: "#1877f2" },
  },
]);
</script>

<template>
  <NuxtLayout>
    <v-container flex h-full items-center justify-center>
      <StyledCard :card-props="{ width: '100%', maxWidth: '30rem' }">
        <v-container flex flex-col gap-y-2>
          <div text-center text-headline-small>Sign in to</div>
          <div flex gap-x-2 items-center justify-center>
            <AppLogo />
            <span text-title-large>{{ SITE_NAME }}</span>
          </div>
          <div text-center>Login and start taking rides with {{ SITE_NAME }}!</div>
          <div flex flex-col gap-y-3>
            <LoginButton
              v-for="loginButtonProps of loginButtonsProps"
              :key="loginButtonProps.provider"
              :="loginButtonProps"
            />
          </div>
        </v-container>
      </StyledCard>
    </v-container>
    <template #left>
      <AppProductList />
    </template>
  </NuxtLayout>
</template>
