<script setup lang="ts">
import type { GenshinSettings } from "#src/models/menu/GenshinSettings";
import type { SettingsRow } from "#src/models/menu/SettingsRow";
import type { GameText } from "genshin-text";

import { SettingsRowKind } from "#src/models/menu/SettingsRowKind";
import { GameButton, GameButtonKind } from "genshin-interface";
import { GameTextKey, getLanguageDisplayName } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The Graphics Quality's words for the tier the setting holds
  qualityValue: string;
  // The settings row this button draws: a choice, an action, a list row or a toggle
  row: Extract<
    SettingsRow,
    {
      kind:
        | SettingsRowKind.Action
        | SettingsRowKind.Choice
        | SettingsRowKind.Language
        | SettingsRowKind.Quality
        | SettingsRowKind.Toggle;
    }
  >;
}

// The settings the button shows and changes, which the host keeps on this device
const settings = defineModel<GenshinSettings>("settings", { required: true });
// The kind of the list that is open, which this row's own list is when the kind is its own
const openedList = defineModel<SettingsRowKind>("openedList");
const { gameText, qualityValue, row } = defineProps<Props>();
// The rows that open a list of the world's own, and the rows the player acts on: a list row opens its list and a toggle
// Flips its setting
const checkIsListRow = (kind: SettingsRowKind): boolean =>
  kind === SettingsRowKind.Quality || kind === SettingsRowKind.Language;
const checkIsActiveRow = (kind: SettingsRowKind): boolean => checkIsListRow(kind) || kind === SettingsRowKind.Toggle;
// A choice's words, which the row's own kind reads from the setting it shows
const choiceValue = computed(() =>
  row.kind === SettingsRowKind.Choice ? row.getValue(gameText, settings.value.language) : "",
);
</script>

<template>
  <GameButton
    class="choice"
    :aria-expanded="checkIsListRow(row.kind) ? openedList === row.kind : undefined"
    :aria-label="gameText[row.labelKey]"
    :disabled="!checkIsActiveRow(row.kind)"
    :kind="GameButtonKind.Row"
    tip=""
    @click="
      row.kind === SettingsRowKind.Toggle
        ? (settings = { ...settings, [row.setting]: !settings[row.setting] })
        : (openedList = openedList === row.kind ? undefined : row.kind)
    "
  >
    <svg class="star" aria-hidden="true" viewBox="0 0 48 48">
      <path d="M 24 0 Q 31 17 48 24 Q 31 31 24 48 Q 17 31 0 24 Q 17 17 24 0 Z" />
    </svg>
    <svg class="star faint" aria-hidden="true" viewBox="0 0 48 48">
      <path d="M 24 0 Q 31 17 48 24 Q 31 31 24 48 Q 17 31 0 24 Q 17 17 24 0 Z" />
    </svg>
    <span class="value">
      <template v-if="row.kind === SettingsRowKind.Quality">{{ qualityValue }}</template>
      <template v-else-if="row.kind === SettingsRowKind.Language">{{
        getLanguageDisplayName(settings.language, settings.language)
      }}</template>
      <template v-else-if="row.kind === SettingsRowKind.Toggle">{{
        gameText[settings[row.setting] ? GameTextKey.SettingsOn : GameTextKey.SettingsOff]
      }}</template>
      <template v-else-if="row.kind === SettingsRowKind.Action">{{ gameText[row.valueKey] }}</template>
      <template v-else>{{ choiceValue }}</template>
    </span>
    <svg v-if="row.kind === SettingsRowKind.Action" class="go" aria-hidden="true" viewBox="0 0 25 25">
      <circle cx="12.5" cy="12.5" r="12.5" />
      <path class="arrow" d="M 8.5 7 L 17 12.5 L 8.5 18 L 10.5 12.5 Z" />
    </svg>
    <span v-else class="caret" />
  </GameButton>
</template>

<style scoped>
.choice {
  position: absolute;
  top: 0;
  right: 0;
  width: calc(var(--unit) * 342);
  height: 100%;
  padding: 0;
  border: none;
  background: rgb(216 203 183 / 0.86);
  color: inherit;
  cursor: inherit;
  font: inherit;
  letter-spacing: inherit;
}

/* The star the value's panel begins at, and a fainter one before it. Provisional: the second's strength, read by eye */
.star {
  position: absolute;
  top: calc(var(--unit) * 4);
  left: calc(var(--unit) * -24);
  width: calc(var(--unit) * 48);
  height: calc(var(--unit) * 48);
  fill: #cebb99;
}

.faint {
  left: calc(var(--unit) * -76);
  opacity: 0.3;
}

.value {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  line-height: 1;
  text-align: center;
  transform: translateY(-50%);
}

.caret {
  position: absolute;
  top: calc(var(--unit) * 23);
  right: calc(var(--unit) * 17.5);
  width: 0;
  height: 0;
  border-top: calc(var(--unit) * 10.5) solid #4b5464;
  border-right: calc(var(--unit) * 8.5) solid transparent;
  border-left: calc(var(--unit) * 8.5) solid transparent;
}

/* An action's mark in place of the caret, a slate disc with a pale gold arrow */
.go {
  position: absolute;
  top: calc(var(--unit) * 15.5);
  right: calc(var(--unit) * 13);
  width: calc(var(--unit) * 25);
  height: calc(var(--unit) * 25);
  fill: #4d5464;
}

.go .arrow {
  fill: #cebf8e;
}
</style>
