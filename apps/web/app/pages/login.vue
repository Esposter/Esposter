<script setup lang="ts">
import { LoginButtonItems } from "@/services/login/LoginButtonItems";
import { RoutePath, SITE_NAME } from "@esposter/shared";

definePageMeta({ middleware: "guest" });
</script>

<template>
  <NuxtLayout>
    <div p-4 flex h-full items-center justify-center ui-body>
      <section flex flex-col gap-8 max-w-sm w-full>
        <header flex flex-col gap-4 items-center>
          <AppLogo width="3rem" aria-hidden="true" />
          <div text-center flex flex-col gap-1>
            <h1 ui-title>Sign in</h1>
            <p text-muted>to continue to {{ SITE_NAME }}</p>
          </div>
        </header>
        <div flex flex-col gap-3>
          <LoginButton
            v-for="loginButtonProps of LoginButtonItems"
            :key="loginButtonProps.provider"
            :="loginButtonProps"
          />
        </div>
        <p text-muted text-center>
          By continuing, you agree to the
          <NuxtLink text-info no-underline hover:underline :to="RoutePath.PrivacyPolicy">Privacy Policy</NuxtLink>.
        </p>
      </section>
    </div>
  </NuxtLayout>
</template>
