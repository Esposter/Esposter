<script setup lang="ts">
import type { User } from "@/db/schema/users";

import { SITE_NAME } from "@/services/esposter/constants";

interface IntroductionCardProps {
  user: User;
}

const { user } = defineProps<IntroductionCardProps>();
const createdAt = useDateFormat(() => user.createdAt, "MMM D, YYYY");
const createdAtTimeAgo = useTimeAgo(() => user.createdAt);
</script>

<template>
  <StyledCard p-6="!" flex="!">
    <div flex-1 grid>
      <div v-if="user.name" class="text-h5" font-bold>{{ user.name }}</div>
      <div>
        {{ user.email }}
      </div>
      <div>Joined {{ SITE_NAME }} on {{ createdAt }} ({{ createdAtTimeAgo }})</div>
    </div>
    <v-avatar v-if="user.image" size="6rem">
      <v-img :src="user.image" :alt="user.name ?? ''" />
    </v-avatar>
  </StyledCard>
</template>
