<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

const { data: session } = await useAuthSession();
const accountCommands = await useAccountCommands();
</script>

<template>
  <AppDockCommandMenu :commands="accountCommands" :label="session ? 'Account' : 'Sign in and more'">
    <UiAvatar v-if="session" :image="session.user.image ?? ''" :name="session.user.name" />
    <UiIcon v-else :meaning="UiIconMeaning.SignIn" />
  </AppDockCommandMenu>
</template>
