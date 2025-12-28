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
    <v-container h-full flex justify-center items-center>
      <StyledCard :card-props="{ width: '100%', maxWidth: '30rem' }">
        <v-container>
          <div class="text-h5" text-center mb-1>Sign in to</div>
          <div mb-2 flex justify-center items-center>
            <AppLogo />
            <span class="text-h6" pl-2>{{ SITE_NAME }}</span>
          </div>
          <div mb-2 text-center>Login and start taking rides with {{ SITE_NAME }}!</div>
          <template v-for="loginButtonProps of loginButtonsProps" :key="loginButtonProps.provider">
            <LoginButton :="loginButtonProps" />
          </template>
        </v-container>
      </StyledCard>
    </v-container>
    <template #left>
      <AppProductList />
    </template>
  </NuxtLayout>
</template>
