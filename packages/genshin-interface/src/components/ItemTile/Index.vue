<script setup lang="ts">
import { ItemRarityFaceGradientMap } from "#src/services/ItemRarityFaceGradientMap";
import { ItemRarityQuestFaceGradientMap } from "#src/services/ItemRarityQuestFaceGradientMap";

interface Props {
  // How many of the item, on the strip across the tile's foot: a number, or the range a reward rolls as words ("4~5")
  count: number | string;
  // The count's font size, in the tile's own units (cqh): a screen unit set outside the tile would resolve against the tile
  countSize?: string;
  // The item's rarity in stars, which colours the tile
  rarity: number;
  // The look the quest screen's reward tiles draw: a face lit by its own gradients, and a translucent count strip.
  // The game's reward lists' look when none is given
  variant?: "quest";
}

const { countSize = "30cqh", variant } = defineProps<Props>();
const faceGradientMap = computed(() => (variant ? ItemRarityQuestFaceGradientMap : ItemRarityFaceGradientMap));
</script>

<template>
  <!-- An item's tile as the game's reward lists draw it, filling the box its parent gives it: the rarity's gradient lit
       from the foot, and the count in white on a darker strip across the bottom 24%, the corners rounded 7%. Measured on
       the wiki's Adventurer Handbook screenshot and the Reputation clip, which agree on the three, four and five star
       tiles, and the Expedition clip's grey tiles, whose items the table gives no stars (rarity zero). A count keeps
       the screen's size rather than the tile's, so each screen passes its own as `countSize`. A two star tile is not
       measured yet and draws bare. The item's own art is the game's and does not ship -->
  <span class="item-tile" :data-rarity="rarity" :data-variant="variant">
    <span class="face" :style="{ background: faceGradientMap[rarity] }">
      <span class="count" aria-hidden="true" :style="{ fontSize: countSize }">{{ count }}</span>
    </span>
  </span>
</template>

<style scoped>
.item-tile {
  display: inline-block;
  container-type: size;
}

.face {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: end;
  overflow: hidden;
  border-radius: 7cqw;
}

.count {
  width: 100%;
  height: 24cqh;
  color: #fff;
  font-weight: 600;
  line-height: 24cqh;
  text-align: center;
}

.item-tile[data-rarity="0"] .count,
.item-tile[data-rarity="1"] .count {
  background: #5e6472;
}

.item-tile[data-rarity="3"] .count {
  background: #52677d;
}

.item-tile[data-rarity="4"] .count {
  background: #666380;
}

.item-tile[data-rarity="5"] .count {
  background: #6d645c;
}

/* The quest screen's count strip is a translucent slate over the face, whatever the rarity, so the face shows through */
.item-tile[data-variant="quest"] .count {
  background: rgb(70 82 101 / 0.73);
}
</style>
