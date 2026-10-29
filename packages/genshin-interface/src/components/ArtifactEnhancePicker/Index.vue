<script setup lang="ts">
import GameButton from "#src/components/GameButton/Index.vue";
import PickerShell from "#src/components/PickerShell/Index.vue";
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
  // The Confirm button's label, which enhances the artifact with what is chosen
  confirmLabel: string;
  // The bag's artifacts offered as fodder, in the order Auto Add takes them
  fodders: EnhanceFodderOption[];
  // Whether Confirm is disabled: no fodder or material is chosen, the Mora is short, or the artifact is maxed
  isConfirmDisabled: boolean;
  // The level the artifact reaches with what is chosen, in the game's level words
  levelLabel: string;
  // The bag's enhancement materials, each with how many the bag holds and how many are chosen
  materials: EnhanceMaterialOption[];
  // The Mora the enhancement costs with what is chosen
  moraCost: number;
  // The Mora label the cost is shown under
  moraLabel: string;
  // The notice shown over the picker while the artifact is already at its top level, empty while it is not
  notice: string;
  // The picker's title, the action it enhances the artifact for
  title: string;
}

const {
  autoAddLabel,
  cancelLabel,
  confirmLabel,
  fodders,
  isConfirmDisabled,
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
  <PickerShell class="enhance-picker" :title>
    <p class="summary">
      <span class="level">{{ levelLabel }}</span>
      <span class="mora">{{ moraLabel }} {{ moraCost }}</span>
    </p>
    <p v-if="notice" class="notice">{{ notice }}</p>
    <ul class="fodders">
      <li v-for="{ caption, id, isSelected, name, rarity } of fodders" :key="id">
        <button
          class="option"
          :aria-pressed="isSelected"
          :data-rarity="rarity"
          type="button"
          @click="emit('fodder', id)"
        >
          <span class="name">{{ name }}</span>
          <span class="caption">{{ caption }}</span>
        </button>
      </li>
    </ul>
    <ul class="materials">
      <li v-for="{ count, id, name, selectedCount } of materials" :key="id" class="material">
        <span class="name">{{ name }}</span>
        <span class="count">{{ selectedCount }}/{{ count }}</span>
        <GameButton :disabled="selectedCount <= 0" :kind="GameButtonKind.Pill" @click="emit('material', id, -1)">
          -
        </GameButton>
        <GameButton :disabled="selectedCount >= count" :kind="GameButtonKind.Pill" @click="emit('material', id, 1)">
          +
        </GameButton>
      </li>
    </ul>
    <div class="actions">
      <GameButton :kind="GameButtonKind.Pill" @click="emit('autoAdd')">{{ autoAddLabel }}</GameButton>
      <GameButton :kind="GameButtonKind.Pill" @click="emit('cancel')">{{ cancelLabel }}</GameButton>
      <GameButton :disabled="isConfirmDisabled" :kind="GameButtonKind.Pill" @click="emit('confirm')">
        {{ confirmLabel }}
      </GameButton>
    </div>
  </PickerShell>
</template>

<style scoped>
.enhance-picker {
  max-height: calc(var(--unit) * 900);
  gap: calc(var(--unit) * 12);
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
  padding: calc(var(--unit) * 10) calc(var(--unit) * 14);
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

.actions {
  display: flex;
  justify-content: flex-end;
  gap: calc(var(--unit) * 8);
}
</style>

<style scoped src="../../styles/artifactPicker.css"></style>
