<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { RoutePath } from "@esposter/shared";

interface Props {
  user: Pick<User, "biography" | "image" | "name">;
  userId: User["id"];
}

const { user, userId } = defineProps<Props>();
const { data: session } = await authClient.useSession(useFetch);
// Looking at your own profile is the moment the avatar or the biography reads wrong, and until now the only way
// To act on that was to leave for the settings page and find it. The form itself stays there — this is the entry
// Point beside it, which is where every reference profile puts one
const isCurrentUser = computed(() => session.value?.user.id === userId);
</script>

<template>
  <div text-center flex flex-col gap-y-3 items-center>
    <StyledAvatar :image="user.image" :name="user.name" :avatar-props="{ size: '6rem' }" />
    <div font-bold text-headline-small>{{ user.name }}</div>
    <div v-if="user.biography" op-medium-emphasis text-body-large>{{ user.biography }}</div>
    <StyledButton
      v-if="isCurrentUser"
      :button-props="{ prependIcon: 'mdi-pencil', size: 'small', text: 'Edit profile', to: RoutePath.UserSettings }"
    />
  </div>
</template>
