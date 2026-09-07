<script setup lang="ts">
import { LoginButtonItems } from "@/services/login/LoginButtonItems";
import { SITE_NAME } from "@esposter/shared";

definePageMeta({ middleware: "guest" });
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
              v-for="loginButtonProps of LoginButtonItems"
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
