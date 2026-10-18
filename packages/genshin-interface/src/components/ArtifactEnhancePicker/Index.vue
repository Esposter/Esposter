<script setup lang="ts">
import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

// One artifact the picker offers as fodder: its name, its caption, its rarity in stars and whether it is chosen
interface EnhanceFodderOption {
  caption: string;
  id: string;
  isSelected: boolean;
  name: string;
  rarity: number;
}

// One enhancement material the picker offers: its name, how many the bag holds and how many are chosen
interface EnhanceMaterialOption {
  count: number;
  id: string;
  name: string;
  selectedCount: number;
}

interface Props {
  // The Auto Add button's label, the game's word for filling the fodder with the lowest-star artifacts it can
  autoAddLabel: string;
  // The Cancel button's label, which closes the picker without enhancing
  cancelLabel: string;
  // Whether Confirm is disabled, which it is while no fodder or material is chosen, the Mora is short, or the artifact is maxed
  confirmDisabled: boolean;
  // The Confirm button's label, which enhances the artifact with what is chosen
  confirmLabel: string;
  // The bag's artifacts offered as fodder, in the order Auto Add takes them
  fodders: EnhanceFodderOption[];
  // The level the artifact reaches with what is chosen, in the game's level words
  levelLabel: string;
  // The bag's enhancement materials, each with how many the bag holds and how many are chosen
  materials: EnhanceMaterialOption[];
  // The notice shown over the picker while the artifact is already at its top level, undefined while it is not
  notice?: string;
  // The Mora the enhancement costs with what is chosen
  moraCost: number;
  // The Mora label the cost is shown under
  moraLabel: string;
  // The picker's title, the action it enhances the artifact for
  title: string;
}

const {
  autoAddLabel,
  cancelLabel,
  confirmDisabled,
  confirmLabel,
  fodders,
  levelLabel,
  materials,
  moraCost,
  moraLabel,
  notice,
  title,
} = defineProps<Props>();
const emit = defineEmits<{
  autoAdd: [];
  cancel: [];
  confirm: [];
  fodder: [id: string];
  material: [id: string, delta: number];
}>();
</script>

<template>
  <div class="enhance-picker" role="dialog" aria-modal="true" :aria-label="title">
    <p class="title">{{ title }}</p>
    <p class="summary">
      <span class="level">{{ levelLabel }}</span>
      <span class="mora">{{ moraLabel }} {{ moraCost }}</span>
    </p>
    <p v-if="notice" class="notice">{{ notice }}</p>
    <ul class="fodders">
      <li v-for="fodder of fodders" :key="fodder.id">
        <button
          class="option"
          :aria-pressed="fodder.isSelected"
          :data-rarity="fodder.rarity"
          type="button"
          @click="emit('fodder', fodder.id)"
        >
          <span class="name">{{ fodder.name }}</span>
          <span class="caption">{{ fodder.caption }}</span>
        </button>
      </li>
    </ul>
    <ul class="materials">
      <li v-for="material of materials" :key="material.id" class="material">
        <span class="name">{{ material.name }}</span>
        <span class="count">{{ material.selectedCount }}/{{ material.count }}</span>
        <GameButton
          :disabled="material.selectedCount <= 0"
          :kind="GameButtonKind.Pill"
          @click="emit('material', material.id, -1)"
        >
          -
        </GameButton>
        <GameButton
          :disabled="material.selectedCount >= material.count"
          :kind="GameButtonKind.Pill"
          @click="emit('material', material.id, 1)"
        >
          +
        </GameButton>
      </li>
    </ul>
    <div class="actions">
      <GameButton :kind="GameButtonKind.Pill" @click="emit('autoAdd')">{{ autoAddLabel }}</GameButton>
      <GameButton :kind="GameButtonKind.Pill" @click="emit('cancel')">{{ cancelLabel }}</GameButton>
      <GameButton :disabled="confirmDisabled" :kind="GameButtonKind.Pill" @click="emit('confirm')">
        {{ confirmLabel }}
      </GameButton>
    </div>
  </div>
</template>

<style scoped>
.enhance-picker {
  position: absolute;
  top: calc(var(--unit) * 120);
  left: calc(var(--unit) * 120);
  width: calc(var(--unit) * 640);
  max-height: calc(var(--unit) * 900);
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 12);
  padding: calc(var(--unit) * 24);
  border-radius: calc(var(--unit) * 12);
  background: rgb(20 24 36 / 0.92);
  color: #ece3d8;
}

.title {
  margin: 0;
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
}

.summary,
.notice {
  display: flex;
  justify-content: space-between;
  margin: 0;
}

.fodders,
.materials {
  display: flex;
  flex-direction: column;
  gap: calc(var(--unit) * 6);
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.option {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: calc(var(--unit) * 10) calc(var(--unit) * 14);
  border: none;
  border-radius: calc(var(--unit) * 8);
  background: rgb(255 255 255 / 0.1);
  color: inherit;
  font: inherit;
  text-align: left;
}

.option[aria-pressed="true"] {
  background: rgb(255 255 255 / 0.28);
}

.material {
  display: flex;
  align-items: center;
  gap: calc(var(--unit) * 8);
}

.material .name {
  flex: 1;
}

.caption {
  opacity: 0.8;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: calc(var(--unit) * 8);
}
</style>
