<script setup lang="ts">
import type { AchievementDefinitionEntry } from "#shared/models/achievement/AchievementDefinitionEntry";
import type { UserAchievementWithDefinition } from "@/models/achievement/UserAchievementWithDefinition";

import { prettify } from "@/util/text/prettify";

interface Props {
  achievementDefinition: AchievementDefinitionEntry;
  userAchievement?: UserAchievementWithDefinition;
}

const { achievementDefinition, userAchievement } = defineProps<Props>();
const displayName = computed(() => prettify(achievementDefinition.name));
const amount = computed(() => userAchievement?.amount ?? 0);
const targetAmount = computed(() => achievementDefinition.amount ?? 1);
</script>

<template>
  <li p-4 text-center flex flex-col gap-2 items-center ui-frame>
    <!-- The badge: its mark on a raised block, lit in the success colour once it is earned -->
    <div
      class="badge"
      :data-unlocked="Boolean(userAchievement?.unlockedAt) || undefined"
      flex
      size-16
      items-center
      justify-center
      ui-raised
    >
      <span :class="achievementDefinition.icon" size-10 />
    </div>
    <h3 ui-heading>{{ displayName }}</h3>
    <p text-muted>{{ achievementDefinition.description }}</p>
    <p v-if="userAchievement?.unlockedAt" text-success>
      Unlocked <NuxtTime :datetime="userAchievement.unlockedAt" day="numeric" month="numeric" year="numeric" />
    </p>
    <div flex-1 />
    <p text-muted>
      {{ achievementDefinition.category }} · <span text-warning>{{ achievementDefinition.points }} points</span>
    </p>
    <UiLoadingBar :label="`${displayName} progress`" :value="(amount / targetAmount) * 100" />
    <p text-muted>{{ amount }} / {{ targetAmount }}</p>
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
