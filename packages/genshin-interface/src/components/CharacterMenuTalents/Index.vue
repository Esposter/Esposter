<script setup lang="ts">
import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // Each combat talent's next level's cost, as the labels its Mora and items are written in, none at its last level
  costs: string[][];
  // Whether each talent's Upgrade is disabled, which it is while the talent cannot rise
  isUpgradeDisabled: boolean[];
  // Whether each talent's Upgrade is drawn, which it is not at the talent's last level, where the game draws none
  isUpgradeShown: boolean[];
  // Each combat talent's level as the reader's language writes it, in the order the game lists them: the normal attack,
  // the Elemental Skill and the Elemental Burst
  levelTexts: string[];
  // Each talent's next level's phase, as its label, empty at its last level
  phases: string[];
  // Why each talent cannot rise now, as its label, empty when it can or is at its last level
  reasons: string[];
  // The Upgrade button's label, the game's word for raising a talent by one level
  upgradeLabel: string;
}

const { costs, isUpgradeDisabled, isUpgradeShown, levelTexts, phases, reasons, upgradeLabel } = defineProps<Props>();
const emit = defineEmits<{ upgrade: [index: number] }>();
</script>

<template>
  <!-- The Talents tab's panel: the three combat talents down its right, each with its level, the phase and cost of its next
       level, why it cannot rise if it cannot, and its Upgrade while it is drawn. The talents' names and the passives under
       them are not drawn yet, since the game's text for them is not decoded -->
  <div class="talents">
    <ul class="talent-list">
      <li v-for="(levelText, index) in levelTexts" :key="index" class="talent">
        <span class="level">{{ levelText }}</span>
        <div class="detail">
          <span class="phase">{{ phases[index] }}</span>
          <ul class="costs">
            <li v-for="(cost, costIndex) in costs[index]" :key="costIndex">{{ cost }}</li>
          </ul>
          <span v-if="reasons[index]" class="reason">{{ reasons[index] }}</span>
        </div>
        <GameButton
          v-if="isUpgradeShown[index]"
          class="upgrade"
          :disabled="isUpgradeDisabled[index]"
          :kind="GameButtonKind.Reply"
          tip=""
          @click="emit('upgrade', index)"
        >
          {{ upgradeLabel }}
        </GameButton>
        <span class="icon" />
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* Measured off the English PC client's Talents tab at 21:9 (references/character-talents.png, 159 seconds), in units
   from the panel's top: the three combat talents' rows sit 90 units apart from 29, each with its icon at the panel's
   right edge. A pixel of that frame at 1440 high is 0.75 units. Colours are provisional */
.talents {
  position: absolute;
  inset: 0;
  color: #fff;
}

.talent-list {
  position: absolute;
  top: calc(var(--unit) * 29);
  right: 0;
  left: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.talent {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-height: calc(var(--unit) * 60);
  margin-bottom: calc(var(--unit) * 30);
  gap: calc(var(--unit) * 16);
}

/* The name above the level is not drawn yet, so the level sits beneath where that name's line would be, as the frame's does */
.level {
  margin-top: calc(var(--unit) * 38);
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  text-shadow: 0 calc(var(--unit) * 1) calc(var(--unit) * 3) rgb(0 0 0 / 0.4);
}

/* The next level's phase, cost and the reason it cannot rise, beside the Upgrade. Their place and size are provisional,
   queued for the user's eyes against the recording */
.detail {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: calc(var(--unit) * 18);
  text-shadow: 0 calc(var(--unit) * 1) calc(var(--unit) * 3) rgb(0 0 0 / 0.4);
}

.costs {
  margin: 0;
  padding: 0;
  list-style: none;
}

.reason {
  color: #ffb4a8;
}

.upgrade {
  font-size: calc(var(--unit) * 18);
  font-weight: 600;
}

.icon {
  width: calc(var(--unit) * 62);
  height: calc(var(--unit) * 62);
  border-radius: 50%;
  background: rgb(255 255 255 / 0.25);
}
</style>
