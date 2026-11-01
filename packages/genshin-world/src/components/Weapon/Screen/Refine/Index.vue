<script setup lang="ts">
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { GameText } from "genshin-text";

import { CURRENT_DOT_REGEX, DIVIDER_OPACITY } from "#src/services/weapon/constants";
import { getWeaponPassive } from "#src/services/weapon/getWeaponPassive";
import { getWeaponRankText } from "#src/services/weapon/getWeaponRankText";
import { OrnamentDivider } from "genshin-interface";
import { fillGameTextValues, GameTextKey, splitGameTextColors } from "genshin-text";

interface Props {
  // The game's words in the reader's language, which the passive's rows and the Refine tab's labels are set in
  gameText: GameText;
  // The names the stat tables cite, in the reader's language, by their text id, which the passive's name is read from
  nameText: Readonly<Record<string, string>>;
  // The weapon's refinement rank, from one to five, whose row the passive's panel marks as held
  refinement: number;
  // The weapon's game data, which its passive is read from
  weaponData: WeaponData;
}

const { gameText, nameText, refinement, weaponData } = defineProps<Props>();
// The passive's name, and the two rows the game's panel lists: the held rank, then the one above it, named by its rank
const passive = computed(() => getWeaponPassive(weaponData, refinement, nameText));
// The held rank's row is the game's Current line, its label coloured in the text, and the next rank's row is labelled by its rank.
// Each row's dot is drawn as a bullet, so the Current line's own dot is left out of its first run
const passiveRows = computed(() =>
  (passive.value?.rows ?? [])
    .slice(refinement - 1, refinement + 1)
    .map((row, index) => ({
      currentSegments: row.isHeld
        ? splitGameTextColors(fillGameTextValues(gameText[GameTextKey.WeaponRefinementCurrent], row.description)).map(
            (segment, segmentIndex) => ({
              ...segment,
              text: segmentIndex === 0 ? segment.text.replace(CURRENT_DOT_REGEX, "") : segment.text,
            }),
          )
        : [],
      description: row.description,
      isHeld: row.isHeld,
      rankText: getWeaponRankText(gameText, refinement + index),
    })),
);
</script>

<template>
  <div class="divider refine-divider"><OrnamentDivider is-middle-hidden :opacity="DIVIDER_OPACITY" /></div>
  <p class="refinement-level">{{ gameText[GameTextKey.WeaponRefinementLevel] }}</p>
  <p class="passive-name">
    <span class="bullet" aria-hidden="true" />{{ passive?.name }}<span class="bullet" aria-hidden="true" />
  </p>
  <div class="passive">
    <p v-for="row of passiveRows" :key="row.rankText" class="passive-row" :class="{ held: row.isHeld }">
      <template v-if="row.isHeld">
        <span v-for="(segment, index) of row.currentSegments" :key="index" :style="{ color: segment.color }">{{
          segment.text
        }}</span>
      </template>
      <template v-else
        ><span class="rank-label">{{ row.rankText }}:</span> {{ row.description }}</template
      >
    </p>
  </div>
  <span class="stats-rule refine-stats-rule" aria-hidden="true" />
  <p class="refine-material">{{ gameText[GameTextKey.WeaponRefinementMaterial] }}</p>
  <span class="pill auto-add refine-auto-add" aria-hidden="true">{{
    gameText[GameTextKey.ArtifactAutoAdd]
  }}</span>
</template>

<style scoped>
.divider {
  position: absolute;
  left: calc(var(--reference-pixel) * 1086);
  width: calc(var(--reference-pixel) * 738);
}

.refine-divider {
  top: calc(var(--reference-pixel) * 173);
}

/* The rule between two stat rows: a faint hairline with a small star at its middle, which the game sets instead of a divider's ends */
.stats-rule {
  position: absolute;
  left: calc(var(--reference-pixel) * 1100);
  width: calc(var(--reference-pixel) * 705);
  height: calc(var(--reference-pixel) * 1);
  background: rgb(200 196 225 / 0.22);
}

.stats-rule::before {
  position: absolute;
  top: calc(var(--reference-pixel) * -4);
  left: calc(50% - var(--reference-pixel) * 4);
  width: calc(var(--reference-pixel) * 9);
  height: calc(var(--reference-pixel) * 9);
  background: rgb(200 196 225 / 0.4);
  clip-path: var(--sparkle-clip-path);
  content: "";
}

.refine-stats-rule {
  top: calc(var(--reference-pixel) * 528);
}

/* The game's cream pill, drawn as the game draws it, for the Auto Add button */
.pill {
  position: absolute;
  height: calc(var(--reference-pixel) * 50);
  border-radius: calc(var(--reference-pixel) * 25);
  background: #ece5d6;
  color: #3d3d48;
  font-size: calc(var(--reference-pixel) * 27);
  font-weight: 600;
  line-height: calc(var(--reference-pixel) * 50);
  text-align: center;
}

.auto-add {
  top: calc(var(--reference-pixel) * 527);
  left: calc(var(--reference-pixel) * 1584);
  width: calc(var(--reference-pixel) * 216);
  background: #e0d6ce;
  line-height: calc(var(--reference-pixel) * 44);
}

.refine-auto-add {
  top: calc(var(--reference-pixel) * 539);
}

/* The Refine tab's level and the passive's name, centred over its panel like the rank above them */
.refinement-level,
.passive-name {
  position: absolute;
  left: calc(var(--reference-pixel) * 1097);
  width: calc(var(--reference-pixel) * 706);
  margin: 0;
  font-weight: 600;
  line-height: 1;
  text-align: center;
}

.refinement-level {
  top: calc(var(--reference-pixel) * 149);
  color: #e9d29a;
  font-size: calc(var(--reference-pixel) * 22);
  letter-spacing: calc(var(--reference-pixel) * 1.3);
}

.passive-name {
  top: calc(var(--reference-pixel) * 208);
  color: #f5f0fb;
  font-size: calc(var(--reference-pixel) * 29);
  letter-spacing: calc(var(--reference-pixel) * 2.2);
}

.refine-material {
  position: absolute;
  top: calc(var(--reference-pixel) * 552);
  left: calc(var(--reference-pixel) * 1104);
  margin: 0;
  color: #e9d29a;
  font-size: calc(var(--reference-pixel) * 26);
  font-weight: 600;
  line-height: 1;
  letter-spacing: calc(var(--reference-pixel) * 1.2);
}

/* The held rank and the next rank's description, wrapped to the panel, the next rank's label in its own colour */
.passive {
  position: absolute;
  top: calc(var(--reference-pixel) * 252);
  left: calc(var(--reference-pixel) * 1104);
  width: calc(var(--reference-pixel) * 696);
  color: #efe9f9;
  font-size: calc(var(--reference-pixel) * 24);
  font-weight: 600;
  line-height: calc(var(--reference-pixel) * 29);
  letter-spacing: calc(var(--reference-pixel) * 1.1);
}

.passive-row {
  position: relative;
  margin: 0 0 calc(var(--reference-pixel) * 16);
  text-indent: calc(var(--reference-pixel) * 24);
}

/* Each rank's row opens on a dot, the bullet the game sets before its label */
.passive-row::before {
  position: absolute;
  top: calc(var(--reference-pixel) * 11);
  left: calc(var(--reference-pixel) * 8);
  width: calc(var(--reference-pixel) * 5);
  height: calc(var(--reference-pixel) * 5);
  border-radius: 50%;
  background: #fff;
  content: "";
}

.rank-label {
  color: #6ad4ee;
}

/* The dots either side of the passive's name, set in the line so the name keeps its centre */
.bullet {
  display: inline-block;
  width: calc(var(--reference-pixel) * 6);
  height: calc(var(--reference-pixel) * 6);
  margin: 0 calc(var(--reference-pixel) * 22);
  border-radius: 50%;
  background: #fff;
  vertical-align: middle;
}
</style>
