<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { authClient } from "@/services/auth/authClient";
import { RoutePath } from "@esposter/shared";

interface Props {
  user: Pick<User, "biography" | "image" | "name">;
  userId: User["id"];
}

const { user, userId } = defineProps<Props>();
const { data: session } = await authClient.useSession(useFetch);
// Looking at your own profile is the moment the avatar or the biography reads wrong, so the way to act on it is
// Here rather than a trip to the settings page. The form itself lives there — this is the entry point beside it,
// Which is where every reference profile puts one
const isCurrentUser = computed(() => session.value?.user.id === userId);
</script>

<template>
  <header flex gap-4 items-center>
    <UiAvatar :image="user.image ?? ''" :name="user.name" is-large />
    <div flex flex-1 flex-col gap-1 min-w-0>
      <div flex gap-2 items-center>
        <h1 flex-1 truncate ui-title>{{ user.name }}</h1>
        <UiButtonLink v-if="isCurrentUser" :to="RoutePath.UserSettings">
          <UiIcon :meaning="UiIconMeaning.Edit" />
          Edit profile
        </UiButtonLink>
      </div>
      <p v-if="user.biography" text-muted max-w-prose ws-pre-wrap>{{ user.biography }}</p>
    </div>
  </header>
</template>
