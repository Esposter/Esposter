<script setup lang="ts">
import { ENHANCE_SLOT_COUNT } from "#src/services/weapon/constants";
import { GameButton, GameButtonKind, WeaponMenuTab } from "genshin-interface";

interface Props {
  // The copies of the weapon the bag holds beside it, which the Refine tab offers, each with its name and level
  copyCells: { id: number; levelText: string; name: string }[];
  // The bag's other weapons the Enhance tab offers as fodder, each with its name, its level and whether it is picked
  fodderCells: { id: number; levelText: string; name: string; picked: boolean }[];
  // Whether the bag holds the refinement material at all, which a refinement can take in place of a copy
  isRefinementMaterialHeld: boolean;
  // The tab the panel is drawn for: the Enhance strip of ores and fodder, or the Refine tab's material and copies
  openTab: WeaponMenuTab;
  // The ores the Enhance tab offers, each with the count the bag holds and the count the player picked
  oreCells: { id: number; name: string; ownedCount: number; pickedCount: number }[];
  // The copy the Refine tab picked, which stands in for the material when it is set
  pickedCopyId?: number;
  // The refinement material the Refine tab offers, with the count the bag holds of it
  refinementMaterial?: { count: number; name: string };
  // The ranks a weapon can still gain, each one a slot on the Refine tab
  refineSlotCount: number;
}

const {
  copyCells,
  fodderCells,
  isRefinementMaterialHeld,
  openTab,
  oreCells,
  pickedCopyId,
  refinementMaterial,
  refineSlotCount,
} = defineProps<Props>();
const emit = defineEmits<{
  pickCopy: [id: number];
  pickMaterial: [];
  pickOre: [id: number];
  toggleFodder: [id: number];
  unpickOre: [id: number];
}>();
// The slots left empty after the open tab's candidates: the Enhance strip's seven, the seventh cut off at its right edge
// As the game's strip cuts it, and the Refine tab's rank slots that no candidate has taken
const emptySlotCount = computed(() =>
  openTab === WeaponMenuTab.Enhance
    ? Math.max(0, ENHANCE_SLOT_COUNT - oreCells.length - fodderCells.length)
    : Math.max(0, refineSlotCount - copyCells.length - (isRefinementMaterialHeld ? 1 : 0)),
);
</script>

<template>
  <div class="cells" :class="openTab === WeaponMenuTab.Enhance ? 'enhance-cells' : 'refine-cells'">
    <template v-if="openTab === WeaponMenuTab.Enhance">
      <div v-for="ore of oreCells" :key="ore.id" class="cell">
        <GameButton
          class="pick"
          :disabled="ore.pickedCount >= ore.ownedCount"
          :kind="GameButtonKind.Row"
          tip=""
          @click="emit('pickOre', ore.id)"
        >
          <span class="cell-name">{{ ore.name }}</span>
          <span class="plus" aria-hidden="true" />
          <span class="caption" aria-hidden="true">{{ ore.pickedCount || "--" }}</span>
        </GameButton>
        <GameButton
          v-if="ore.pickedCount > 0"
          class="unpick"
          :kind="GameButtonKind.Row"
          tip=""
          @click="emit('unpickOre', ore.id)"
        >
          −
        </GameButton>
      </div>
      <div v-for="fodder of fodderCells" :key="fodder.id" class="cell">
        <GameButton
          class="pick"
          :aria-pressed="fodder.picked"
          :kind="GameButtonKind.Row"
          tip=""
          @click="emit('toggleFodder', fodder.id)"
        >
          <span class="cell-name">{{ fodder.name }}</span>
          <span class="plus" aria-hidden="true" />
          <span class="caption" aria-hidden="true">{{ fodder.levelText }}</span>
        </GameButton>
      </div>
    </template>
    <template v-else>
      <div v-if="refinementMaterial && isRefinementMaterialHeld" class="cell">
        <GameButton
          class="pick"
          :aria-pressed="pickedCopyId === undefined"
          :kind="GameButtonKind.Row"
          tip=""
          @click="emit('pickMaterial')"
        >
          <span class="cell-name">{{ refinementMaterial.name }}</span>
          <span class="plus" aria-hidden="true" />
          <span class="caption" aria-hidden="true">{{ refinementMaterial.count }}</span>
        </GameButton>
      </div>
      <div v-for="copy of copyCells" :key="copy.id" class="cell">
        <GameButton
          class="pick"
          :aria-pressed="pickedCopyId === copy.id"
          :kind="GameButtonKind.Row"
          tip=""
          @click="emit('pickCopy', copy.id)"
        >
          <span class="cell-name">{{ copy.name }}</span>
          <span class="plus" aria-hidden="true" />
          <span class="caption" aria-hidden="true">{{ copy.levelText }}</span>
        </GameButton>
      </div>
    </template>
    <div v-for="slot in emptySlotCount" :key="slot" class="cell">
      <span class="pick" aria-hidden="true">
        <span class="plus" />
        <span class="caption">--</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
/* Enhance's panel: a strip of slots, each a grey card over the cream band its count sits on, the ores first */
.cells {
  position: absolute;
  display: flex;
  overflow: hidden;
}

.enhance-cells {
  top: calc(var(--reference-pixel) * 600);
  left: calc(var(--reference-pixel) * 1104);
  width: calc(var(--reference-pixel) * 714);
  height: calc(var(--reference-pixel) * 122);
  gap: calc(var(--reference-pixel) * 13);
}

.refine-cells {
  top: calc(var(--reference-pixel) * 604);
  left: calc(var(--reference-pixel) * 1222);
  gap: calc(var(--reference-pixel) * 18);
}

.cell {
  position: relative;
  flex: none;
  width: calc(var(--reference-pixel) * 98.5);
  height: calc(var(--reference-pixel) * 122);
}

.refine-cells .cell {
  width: calc(var(--reference-pixel) * 101);
}

.pick {
  position: absolute;
  inset: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  border: none;
  border-radius: calc(var(--reference-pixel) * 12);
  background: linear-gradient(#6f6f7b 0 80%, #ece6e0 80% 100%);
  color: inherit;
  cursor: inherit;
  font: inherit;
}

.pick:disabled {
  opacity: 0.6;
}

.pick[aria-pressed="true"] {
  background: linear-gradient(#6e707c 0 80%, #f6f2ee 80% 100%);
}

/* The slot's plus, centred on the card's grey above its cream band */
.plus {
  position: absolute;
  top: calc(var(--reference-pixel) * 29);
  left: calc(50% - var(--reference-pixel) * 20);
  width: calc(var(--reference-pixel) * 40);
  height: calc(var(--reference-pixel) * 40);
}

.plus::before,
.plus::after {
  position: absolute;
  top: 50%;
  left: 50%;
  background: #bab9c0;
  content: "";
  translate: -50% -50%;
}

.plus::before {
  width: calc(var(--reference-pixel) * 40);
  height: calc(var(--reference-pixel) * 7);
}

.plus::after {
  width: calc(var(--reference-pixel) * 7);
  height: calc(var(--reference-pixel) * 40);
}

.caption {
  position: absolute;
  top: calc(var(--reference-pixel) * 101);
  right: 0;
  left: 0;
  color: #55555e;
  font-size: calc(var(--reference-pixel) * 16);
  font-weight: 600;
  line-height: 1;
  text-align: center;
}

/* A slot's name is read aloud over the whole slot, its art not drawn; it is clear so only its slot is the thing clicked */
.cell-name {
  position: absolute;
  inset: 0;
  color: transparent;
  font-size: 1px;
}

.unpick {
  position: absolute;
  top: calc(var(--reference-pixel) * 4);
  right: calc(var(--reference-pixel) * 4);
  width: calc(var(--reference-pixel) * 18);
  height: calc(var(--reference-pixel) * 18);
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgb(0 0 0 / 0.5);
  color: #fff;
  font: inherit;
  font-size: calc(var(--reference-pixel) * 14);
  line-height: 1;
}
</style>
