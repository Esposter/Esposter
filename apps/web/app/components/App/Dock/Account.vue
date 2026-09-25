<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { authClient } from "@/services/auth/authClient";

const { data: session } = await authClient.useSession(useFetch);
const accountCommands = await useAccountCommands();
</script>

<template>
  <AppDockCommandMenu :commands="accountCommands" :label="session ? 'Account' : 'Sign in and more'">
    <UiAvatar v-if="session" :image="session.user.image ?? ''" :name="session.user.name" />
    <UiIcon v-else :meaning="UiIconMeaning.SignIn" />
  </AppDockCommandMenu>
</template>
