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
  <li>
    <!-- The rank is the list's own ordinal column, a fixed width before the mark, so every avatar still lines up -->
    <NuxtLink :aria-current="isMyEntry || undefined" :to="RoutePath.User(entry.user.id)" ui-item no-underline>
      <span text-center shrink-0 w-6 ui-heading>{{ entry.rank }}</span>
      <UiItemContent :image="entry.user.image ?? ''" :title="entry.user.name">
        <template #append>
          <span text-sm text-muted text-nowrap>{{ entry.unlockCount }} unlocked</span>
          <span text-warning flex shrink-0 gap-1 items-center>
            <UiIcon :meaning="UiIconMeaning.Achievement" />
            {{ entry.points }}
          </span>
        </template>
      </UiItemContent>
    </NuxtLink>
  </li>
</template>
