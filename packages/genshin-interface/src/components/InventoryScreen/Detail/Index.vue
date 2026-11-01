<script setup lang="ts">
import type { InventoryCell } from "#src/models/InventoryCell";
import type { InventoryWeaponDetails } from "#src/models/InventoryWeaponDetails";

import GameButton from "#src/components/GameButton/Index.vue";
import RarityStars from "#src/components/RarityStars/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The entry the panel shows, its name, rarity, caption and lock
  cell: InventoryCell;
  // Whether the bag is in its destroy mode, where a tick chooses an entry for a destroy rather than showing it
  isDestroying: boolean;
  // Whether the open tab offers the sort, as the weapons' and artifacts' do
  isSortable: boolean;
  // The Lock button's words, shown on an unlocked bag artifact
  lockLabel: string;
  // The weapon's details the panel draws under its caption, undefined for any entry that is not a weapon with details
  weapon?: InventoryWeaponDetails;
  // The Unlock button's words, shown on a locked bag artifact
  unlockLabel: string;
}

const emit = defineEmits<{ lock: [id: string] }>();
const { cell, isDestroying, isSortable, lockLabel, unlockLabel, weapon } = defineProps<Props>();
</script>

<template>
  <section class="detail" :data-rarity="cell.rarity">
    <p class="detail-name">{{ cell.name }}</p>
    <RarityStars
      v-if="isSortable"
      class="detail-stars"
      aria-hidden="true"
      color="var(--rarity-gold)"
      :rarity="cell.rarity"
    />
    <p class="detail-caption">{{ cell.caption }}</p>
    <template v-if="weapon">
      <p class="weapon-kind">{{ weapon.kind }}</p>
      <p class="weapon-stat-label">{{ weapon.secondaryStat.label }}</p>
      <p class="weapon-stat-value">{{ weapon.secondaryStat.value }}</p>
      <p class="weapon-stat-label weapon-base-label">{{ weapon.baseAttack.label }}</p>
      <p class="weapon-base-value">{{ weapon.baseAttack.value }}</p>
      <p class="weapon-refinement">{{ weapon.refinement }}</p>
      <p class="weapon-passive-name">{{ weapon.passiveName }}</p>
      <p class="weapon-passive">{{ weapon.passiveText }}</p>
      <p class="weapon-description">{{ weapon.description }}</p>
    </template>
    <GameButton
      v-if="cell.isLockable && !isDestroying"
      class="lock translucent-button"
      :kind="GameButtonKind.Row"
      tip=""
      @click="emit('lock', cell.id)"
    >
      {{ cell.isLocked ? unlockLabel : lockLabel }}
    </GameButton>
  </section>
</template>

<style scoped>
/* The info block's purple runs from under the name band to the cream body at 286 units, measured off the recording */
.detail {
  --detail-head-color: #635687;
  --detail-head-end-color: #a176b5;

  position: absolute;
  top: calc(var(--unit) * 114);
  left: calc(var(--unit) * 1298);
  width: calc(var(--unit) * 493);
  height: calc(var(--unit) * 844);
  box-sizing: border-box;
  background: linear-gradient(
    to bottom,
    var(--detail-head-color) calc(var(--unit) * 60),
    var(--detail-head-end-color) calc(var(--unit) * 286),
    #ece3d8 calc(var(--unit) * 286),
    #ece3d8 calc(var(--unit) * 786),
    #fde5b9 calc(var(--unit) * 786)
  );
  color: #3b4255;
}

.detail[data-rarity="5"] {
  --detail-head-color: #7a4e22;
  --detail-head-end-color: #7a4e22;
}

.detail-name {
  height: calc(var(--unit) * 60);
  margin: 0;
  padding: 0 calc(var(--unit) * 28);
  box-sizing: border-box;
  background: #9e57d7;
  color: #ece3d8;
  font-size: calc(var(--unit) * 37);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 2);
  line-height: calc(var(--unit) * 60);
}

/* The rarity's gold stars on the info block under the name, on the equipment tabs only */
.detail-stars {
  position: absolute;
  top: calc(var(--unit) * 242);
  left: calc(var(--unit) * 29);
  margin: 0;
  font-size: calc(var(--unit) * 28);
  letter-spacing: calc(var(--unit) * 4.5);
  line-height: calc(var(--unit) * 28);
}

/* A weapon's kind, stats, refinement rank, passive and description, each placed off the recording's panel: the purple head's
   lines at 70, 100, 122, 159 and 187 units, the refinement badge at 358 and the cream body's passive from 396 down */
.weapon-kind,
.weapon-stat-label,
.weapon-stat-value,
.weapon-base-value,
.weapon-passive-name,
.weapon-passive,
.weapon-description {
  position: absolute;
  left: calc(var(--unit) * 28);
  width: calc(var(--unit) * 437);
  margin: 0;
}

.weapon-kind {
  top: calc(var(--unit) * 70);
  color: #ffffff;
  font-size: calc(var(--unit) * 20);
  font-weight: 600;
  line-height: calc(var(--unit) * 24);
}

.weapon-stat-label {
  top: calc(var(--unit) * 100);
  color: #b3add3;
  font-size: calc(var(--unit) * 20);
  line-height: calc(var(--unit) * 24);
}

.weapon-base-label {
  top: calc(var(--unit) * 159);
}

.weapon-stat-value {
  top: calc(var(--unit) * 122);
  color: #ffffff;
  font-size: calc(var(--unit) * 26);
  font-weight: 600;
  line-height: calc(var(--unit) * 32);
}

.weapon-base-value {
  top: calc(var(--unit) * 187);
  color: #ffffff;
  font-size: calc(var(--unit) * 40);
  font-weight: 600;
  line-height: calc(var(--unit) * 48);
}

/* The refinement rank's badge, a peach square with the rank in it, beside the stars' row */
.weapon-refinement {
  position: absolute;
  top: calc(var(--unit) * 358);
  left: calc(var(--unit) * 29);
  width: calc(var(--unit) * 28);
  height: calc(var(--unit) * 25);
  margin: 0;
  border-radius: calc(var(--unit) * 4);
  background: #f5a16e;
  color: #3b4255;
  font-size: calc(var(--unit) * 20);
  font-weight: 600;
  line-height: calc(var(--unit) * 25);
  text-align: center;
}

.weapon-passive-name {
  top: calc(var(--unit) * 396);
  color: #3b4255;
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
  line-height: calc(var(--unit) * 28);
}

.weapon-passive {
  top: calc(var(--unit) * 424);
  color: #3b4255;
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 29);
}

.weapon-description {
  top: calc(var(--unit) * 648);
  color: #6c6762;
  font-size: calc(var(--unit) * 24);
  line-height: calc(var(--unit) * 29);
}

/* The level's dark tag, 254 units under the name band */
.detail-caption {
  width: fit-content;
  margin: calc(var(--unit) * 254) 0 0 calc(var(--unit) * 28);
  padding: calc(var(--unit) * 2) calc(var(--unit) * 8);
  border-radius: calc(var(--unit) * 4);
  background: rgb(45 48 60 / 0.9);
  color: #ece3d8;
  font-size: calc(var(--unit) * 24);
  font-weight: 600;
  line-height: calc(var(--unit) * 20);
}

.lock {
  position: absolute;
  bottom: calc(var(--unit) * 88);
  left: calc(var(--unit) * 28);
  width: calc(var(--unit) * 437);
  height: calc(var(--unit) * 52);
}
</style>

<style scoped src="../../../styles/translucentButton.css"></style>
