<script setup lang="ts">
import { LoginButtonItems } from "@/services/login/LoginButtonItems";
import { SITE_NAME } from "@esposter/shared";

definePageMeta({ middleware: "guest" });
</script>

<template>
  <NuxtLayout>
    <div p-4 flex h-full items-center justify-center ui-body>
      <section p-6 text-center flex flex-col gap-4 w-full max-w-prose ui-frame>
        <h1 flex flex-col gap-2 items-center ui-body>
          <span text-muted>Sign in to</span>
          <span flex gap-2 items-center ui-title><AppLogo /> {{ SITE_NAME }}</span>
        </h1>
        <p>Login and start taking rides with {{ SITE_NAME }}!</p>
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
