<script setup lang="ts">
import GameButton from "#src/components/GameButton/Index.vue";
import { GameButtonKind } from "#src/models/GameButtonKind";

interface Props {
  // The dialog's way out without destroying, in the reader's language
  cancelLabel: string;
  destroyConfirmButtonLabel: string;
  // The dialog's title, the line over its list of names, and the warning that the destruction cannot be undone
  destroyConfirmListLabel: string;
  destroyConfirmTitle: string;
  destroyConfirmWarningLabel: string;
  // The line the dialog shows where the bag cannot take what the chosen entries return, in the reader's language
  destroyFullLabel: string;
  // The names of the entries chosen for a destroy, listed in its dialog
  destroyNames: string[];
  // The materials the chosen entries return, each listed as its name and count, under the dialog's recovered label
  destroyRecoveredLabel: string;
  destroyRecoveredNames: string[];
  // Whether the chosen entries' returns do not all fit in the bag, which holds the dialog's OK off
  isDestroyFull: boolean;
}

const emit = defineEmits<{ cancelDestroy: []; confirmDestroy: [] }>();
const {
  cancelLabel,
  destroyConfirmButtonLabel,
  destroyConfirmListLabel,
  destroyConfirmTitle,
  destroyConfirmWarningLabel,
  destroyFullLabel,
  destroyNames,
  destroyRecoveredLabel,
  destroyRecoveredNames,
  isDestroyFull,
} = defineProps<Props>();
const cancelButton = useTemplateRef("cancelButton");

// The screen moves the keyboard's focus to this Cancel as the dialog opens
defineExpose({ focus: () => cancelButton.value?.focus() });
</script>

<template>
  <!-- The dialog the Destroy button opens over the bag: the entries to be destroyed, and the warning that it cannot be
       undone, in the game's own wording. Provisional until the dialog is recorded -->
  <section class="confirm" role="dialog" aria-modal="true" :aria-label="destroyConfirmTitle">
    <p class="confirm-title">{{ destroyConfirmTitle }}</p>
    <p class="confirm-list-label">{{ destroyConfirmListLabel }}</p>
    <ul class="confirm-names">
      <li v-for="(name, index) of destroyNames" :key="index">{{ name }}</li>
    </ul>
    <p class="confirm-warning">{{ destroyConfirmWarningLabel }}</p>
    <p v-if="isDestroyFull" class="confirm-warning">{{ destroyFullLabel }}</p>
    <template v-if="destroyRecoveredNames.length">
      <p class="confirm-list-label">{{ destroyRecoveredLabel }}</p>
      <ul class="confirm-names">
        <li v-for="(name, index) of destroyRecoveredNames" :key="index">{{ name }}</li>
      </ul>
    </template>
    <div class="confirm-buttons">
      <GameButton
        ref="cancelButton"
        class="translucent-button"
        :kind="GameButtonKind.Row"
        tip=""
        @click="emit('cancelDestroy')"
      >
        {{ cancelLabel }}
      </GameButton>
      <GameButton
        class="translucent-button"
        :disabled="isDestroyFull"
        :kind="GameButtonKind.Row"
        tip=""
        @click="emit('confirmDestroy')"
      >
        {{ destroyConfirmButtonLabel }}
      </GameButton>
    </div>
  </section>
</template>

<style scoped>
.confirm-title,
.confirm-list-label,
.confirm-warning {
  margin: 0 0 calc(var(--unit) * 12);
}

.confirm-title {
  font-size: calc(var(--unit) * 22);
}

.confirm-names {
  margin: 0 0 calc(var(--unit) * 12);
  padding: 0;
  list-style: none;
}

.confirm-warning {
  color: #ff9a7a;
}

.confirm-buttons {
  display: flex;
  justify-content: flex-end;
  gap: calc(var(--unit) * 12);
}
</style>

<style scoped src="../../../styles/confirmDialog.css"></style>

<style scoped src="../../../styles/translucentButton.css"></style>
