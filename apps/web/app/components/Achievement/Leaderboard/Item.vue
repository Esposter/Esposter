<script setup lang="ts">
import type { PointsLeaderboardEntry } from "#shared/models/achievement/PointsLeaderboardEntry";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { RoutePath } from "@esposter/shared";

interface Props {
  entry: PointsLeaderboardEntry;
  isMyEntry?: true;
}

const { entry, isMyEntry } = defineProps<Props>();
</script>

<template>
  <li :class="{ 'bg-accent/10': isMyEntry }" :aria-current="isMyEntry || undefined" px-3 py-2 flex gap-3 items-center>
    <span text-center w-8 ui-heading>{{ entry.rank }}</span>
    <NuxtInvisibleLink :to="RoutePath.User(entry.user.id)" flex flex-1 gap-3 items-center min-w-0>
      <UiAvatar :image="entry.user.image ?? ''" :name="entry.user.name" />
      <span truncate>{{ entry.user.name }}</span>
    </NuxtInvisibleLink>
    <span text-muted>{{ entry.unlockCount }} unlocked</span>
    <span text-warning flex gap-1 items-center>
      <UiIcon :meaning="UiIconMeaning.Achievement" />
      {{ entry.points }}
    </span>
  </li>
</template>
