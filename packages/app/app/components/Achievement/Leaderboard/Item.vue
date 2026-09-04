<script setup lang="ts">
import type { PointsLeaderboardEntry } from "#shared/models/achievement/PointsLeaderboardEntry";

import { RoutePath } from "@esposter/shared";

interface Props {
  entry: PointsLeaderboardEntry;
  isMyEntry?: true;
}

const { entry, isMyEntry } = defineProps<Props>();
</script>

<template>
  <v-sheet
    px-3
    py-2
    rd
    flex
    gap-x-3
    items-center
    :border="isMyEntry"
    :color="isMyEntry ? 'primary-opacity-10' : undefined"
  >
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
