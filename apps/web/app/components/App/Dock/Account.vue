<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DOCK_POPOVER_POSITION_AREA } from "@/services/app/constants";
import { authClient } from "@/services/auth/authClient";
import { runCommand } from "@/services/ui/runCommand";

const { data: session } = await authClient.useSession(useFetch);
const accountCommands = await useAccountCommands();
</script>

<template>
  <UiMenu
    :items="accountCommands.map(({ description, icon, id, title }) => ({ description, icon, title, value: id }))"
    :label="session ? 'Account' : 'Sign in and more'"
    :position-area="DOCK_POPOVER_POSITION_AREA"
    p-0
    size-10
    @select="
      async (value) => {
        const command = accountCommands.find(({ id }) => id === value);
        if (command) await runCommand(command);
      }
    "
  >
    <UiAvatar v-if="session" :image="session.user.image ?? ''" :name="session.user.name" />
    <UiIcon v-else :meaning="UiIconMeaning.SignIn" />
  </UiMenu>
</template>
