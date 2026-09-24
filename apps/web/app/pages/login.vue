<script setup lang="ts">
import { LoginButtonItems } from "@/services/login/LoginButtonItems";
import { SITE_NAME } from "@esposter/shared";

definePageMeta({ middleware: "guest" });
</script>

<template>
  <NuxtLayout>
    <div p-4 flex h-full items-center justify-center ui-body>
      <section text-center flex flex-col gap-6 max-w-prose w-full>
        <h1 flex flex-col gap-2 items-center ui-body>
          <span text-muted>Sign in to</span>
          <span flex gap-2 items-center ui-title><AppLogo aria-hidden="true" /> {{ SITE_NAME }}</span>
        </h1>
        <div flex flex-col gap-3>
          <LoginButton
            v-for="loginButtonProps of LoginButtonItems"
            :key="loginButtonProps.provider"
            :="loginButtonProps"
          />
        </div>
      </section>
    </div>
  </NuxtLayout>
</template>
