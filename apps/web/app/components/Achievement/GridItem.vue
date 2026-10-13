<script setup lang="ts">
import type { AchievementDefinitionEntry } from "#shared/models/achievement/AchievementDefinitionEntry";
import type { UserAchievementWithDefinition } from "@/models/achievement/UserAchievementWithDefinition";

import { RARE_ACHIEVEMENT_THRESHOLD } from "@/services/achievement/constants";
import { prettify } from "@/util/text/prettify";

interface Props {
  achievementDefinition: AchievementDefinitionEntry;
  // The share of registered users who have unlocked it, as a percentage, once the rarity read has landed
  rarity?: number;
  userAchievement?: UserAchievementWithDefinition;
}

const { achievementDefinition, rarity, userAchievement } = defineProps<Props>();
const displayName = computed(() => prettify(achievementDefinition.name));
const amount = computed(() => userAchievement?.amount ?? 0);
const targetAmount = computed(() => achievementDefinition.amount ?? 1);
const isRare = computed(() => rarity !== undefined && rarity < RARE_ACHIEVEMENT_THRESHOLD);
</script>

<template>
  <li p-3 flex flex-col gap-3 ui-frame>
    <div flex gap-3 items-center>
      <!-- The badge: its mark on a raised block, lit in the success colour once it is earned -->
      <div
        class="badge"
        :data-unlocked="Boolean(userAchievement?.unlockedAt) || undefined"
        flex
        shrink-0
        size-10
        items-center
        justify-center
        ui-raised
      >
        <span :class="achievementDefinition.icon" size-6 />
      </div>
      <div flex flex-1 flex-col min-w-0>
        <h3 truncate ui-heading>{{ displayName }}</h3>
        <p text-sm text-muted truncate>
          {{ achievementDefinition.category }} · <span text-warning>{{ achievementDefinition.points }} points</span>
        </p>
      </div>
    </div>
    <p text-muted>{{ achievementDefinition.description }}</p>
    <p v-if="rarity !== undefined" text-sm text-muted>
      {{ Math.round(rarity * 10) / 10 }}% of users<span v-if="isRare" text-warning> · Rare</span>
    </p>
    <div flex-1 />
    <p v-if="userAchievement?.unlockedAt" text-sm text-success>
      Unlocked <NuxtTime :datetime="userAchievement.unlockedAt" day="numeric" month="numeric" year="numeric" />
    </p>
    <div flex gap-2 items-center>
      <UiLoadingBar :label="`${displayName} progress`" :value="(amount / targetAmount) * 100" flex-1 />
      <span text-sm text-muted text-nowrap>{{ amount }} / {{ targetAmount }}</span>
    </div>
  </li>
</template>

<style scoped>
.badge {
  color: var(--ui-muted);
}

.badge[data-unlocked] {
  background-color: var(--ui-success);
  color: var(--ui-background);
}
</style>
