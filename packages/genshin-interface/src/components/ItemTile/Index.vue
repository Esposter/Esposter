<script setup lang="ts">
interface Props {
  // How many of the item, on the strip across the tile's foot: a number, or the range a reward rolls as words ("4~5")
  count: number | string;
  // The item's rarity in stars, which colours the tile
  rarity: number;
}

const { count, rarity } = defineProps<Props>();
</script>

<template>
  <!-- An item's tile as the game's reward lists draw it, filling the box its parent gives it: the rarity's gradient lit
       from the foot, and the count in white on a darker strip across the bottom 24%, the corners rounded 7%. Measured on
       the wiki's Adventurer Handbook screenshot and the Reputation clip, which agree on the three, four and five star
       tiles and differ only in the count's size, which a screen sets as `--count-size` since it does not follow the
       tile's: the handbook's counts stand as high on its 188 tiles as on its 141. A one or two star tile is not measured
       yet and draws bare. The item's own art is the game's and does not ship -->
  <span class="item-tile" :data-rarity="rarity">
    <span class="face">
      <span class="count" aria-hidden="true">{{ count }}</span>
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

.item-tile[data-rarity="3"] .face {
  background: linear-gradient(#79809d, #7485a6 30%, #748faf 60%, #7298b9 77%);
}

.item-tile[data-rarity="4"] .face {
  background: linear-gradient(#7e77a2, #877aac 30%, #917db4 60%, #9c80bc 77%);
}

.item-tile[data-rarity="5"] .face {
  background: linear-gradient(#b0804c, #ba8446 30%, #c38946 60%, #cc8d43 77%);
}

.count {
  width: 100%;
  height: 24cqh;
  color: #fff;
  font-size: var(--count-size, 30cqh);
  font-weight: 600;
  line-height: 24cqh;
  text-align: center;
}

.item-tile[data-rarity="3"] .count {
  background: #4d6680;
}

.item-tile[data-rarity="4"] .count {
  background: #665d82;
}

.item-tile[data-rarity="5"] .count {
  background: #6b625c;
}
</style>
