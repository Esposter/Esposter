<script setup lang="ts">
import type { PointsLeaderboardEntry } from "#shared/models/achievement/PointsLeaderboardEntry";

import { RoutePath } from "@esposter/shared";

interface LeaderboardItemProps {
  entry: PointsLeaderboardEntry;
  isSelf?: true;
}

const { entry, isSelf } = defineProps<LeaderboardItemProps>();
</script>

<template>
  <v-sheet px-3 py-2 rd flex gap-x-3 items-center :border="isSelf" :color="isSelf ? 'primary-opacity-10' : undefined">
    <span font-bold text-center w-8 text-title-medium>{{ entry.rank }}</span>
    <NuxtInvisibleLink :to="RoutePath.User(entry.user.id)">
      <StyledAvatar :image="entry.user.image" :name="entry.user.name" />
    </NuxtInvisibleLink>
    <NuxtInvisibleLink font-bold :to="RoutePath.User(entry.user.id)">{{ entry.user.name }}</NuxtInvisibleLink>
    <v-spacer />
    <span op-medium-emphasis text-body-small>{{ entry.unlockCount }} unlocked</span>
    <v-chip flex gap-x-1 color="orange" size="small">
      <v-icon icon="mdi-trophy" size="x-small" />
      {{ entry.points }}
    </v-chip>
  </v-sheet>
</template>
