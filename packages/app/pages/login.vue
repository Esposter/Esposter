<script setup lang="ts">
import type { BuiltInProviderType } from "@auth/core/providers";
import type { Component, CSSProperties } from "vue";

import { SITE_NAME } from "@/shared/services/esposter/constants";
import { toTitleCase } from "@/util/text/toTitleCase";

interface ProviderProps {
  buttonStyle?: CSSProperties;
  logo: Component;
  logoAttrs?: Record<string, unknown>;
  logoStyle?: CSSProperties;
  provider: BuiltInProviderType;
}

definePageMeta({ middleware: "guest-only" });

const { signIn } = useAuth();
const providerProps = ref<ProviderProps[]>([
  {
    buttonStyle: { backgroundColor: "#4285f4", paddingLeft: "0" },
    logo: markRaw(defineAsyncComponent(() => import(`@/components/Visual/Logo/Google.vue`))),
    logoStyle: {
      backgroundColor: "#fff",
      borderRadius: "4px 0 0 4px",
      height: "3rem",
      padding: ".625rem",
      width: "3rem",
    },
    provider: "google",
  },
  {
    buttonStyle: { backgroundColor: "#252525" },
    logo: markRaw(defineAsyncComponent(() => import(`@/components/Visual/Logo/Github.vue`))),
    logoAttrs: { fill: "#fff" },
    provider: "github",
  },
  {
    buttonStyle: { backgroundColor: "#1877f2" },
    logo: markRaw(defineAsyncComponent(() => import(`@/components/Visual/Logo/Facebook.vue`))),
    provider: "facebook",
  },
]);
</script>

<template>
  <NuxtLayout>
    <template #left>
      <EsposterProductList />
    </template>
    <v-container h-full flex justify-center items-center>
      <StyledCard :card-props="{ width: '100%', maxWidth: '500' }">
        <v-container>
          <div class="text-h5" text-center mb-1>Sign in to</div>
          <div mb-2 flex justify-center items-center>
            <EsposterLogo />
            <span class="text-h6" pl-2>{{ SITE_NAME }}</span>
          </div>
          <div mb-2 text-center>Login and start taking rides with {{ SITE_NAME }}!</div>
          <template v-for="{ provider, logo, logoStyle, logoAttrs, buttonStyle } of providerProps" :key="provider">
            <button
              class="button"
              :style="{ ...buttonStyle }"
              pl-2
              flex
              items-center
              w-full
              rd
              mb-3
              h-12
              @click="signIn(provider)"
            >
              <component :is="logo" :style="{ ...logoStyle }" w-8 :="{ ...logoAttrs }" />
              <span font-bold text-white mx-auto>{{ toTitleCase(provider) }}</span>
            </button>
          </template>
        </v-container>
      </StyledCard>
    </v-container>
  </NuxtLayout>
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
