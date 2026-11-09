<script setup lang="ts">
import type { GenshinSettings } from "#src/models/menu/GenshinSettings";
import type { SettingsOption } from "#src/models/menu/SettingsOption";
import type { SettingsRow } from "#src/models/menu/SettingsRow";
import type { SettingsTab } from "#src/models/menu/SettingsTab";
import type { GameText } from "genshin-text";

import MenuSettingsRowChoice from "#src/components/Menu/Settings/Row/Choice/Index.vue";
import MenuSettingsRowOptions from "#src/components/Menu/Settings/Row/Options/Index.vue";
import MenuSettingsRowTrack from "#src/components/Menu/Settings/Row/Track/Index.vue";
import { SettingsRowKind } from "#src/models/menu/SettingsRowKind";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The options the open list offers, each with whether it is the setting now and the choice that sets it
  options: SettingsOption[];
  // The Graphics Quality's words for the tier the setting holds
  qualityValue: string;
  // The settings row this row draws
  row: SettingsRow;
  // The tab the row is on, under which the Audio tab draws a volume's speaker
  tab: SettingsTab;
}

// The settings the row shows and changes, which the host keeps on this device
const settings = defineModel<GenshinSettings>("settings", { required: true });
// The kind of the list that is open, which this row's own list is when the kind is its own
const openedList = defineModel<SettingsRowKind>("openedList");
defineProps<Props>();
</script>

<template>
  <div class="row">
    <span class="label">{{ gameText[row.labelKey] }}</span>
    <MenuSettingsRowTrack
      v-if="
        row.kind === SettingsRowKind.Range || row.kind === SettingsRowKind.Slider || row.kind === SettingsRowKind.Volume
      "
      v-model:settings="settings"
      :game-text
      :row
      :tab
    />
    <MenuSettingsRowChoice
      v-else
      v-model:opened-list="openedList"
      v-model:settings="settings"
      :game-text
      :quality-value
      :row
    />
  </div>
  <MenuSettingsRowOptions v-if="openedList === row.kind" :label="gameText[row.labelKey]" :options />
</template>

<style scoped>
/* The row's glass, lighter over its label and a tan panel under its value from 977 across, solved from the clip's rows
   Over the world between them. Its colour is 240 231 215: the clip's pill interior reads 226 217 202 over the same world.
   Provisional: the faint shadow round its edge, read off the clip's column through a row against the world beside it */
.row {
  position: relative;
  flex: none;
  height: calc(var(--unit) * 56);
  border-radius: calc(var(--unit) * 28);
  background: rgb(240 231 215 / 0.78);
  box-shadow: 0 0 calc(var(--unit) * 3) rgb(0 0 0 / 0.15);
  --lit-shadow:
    0 0 calc(var(--unit) * 1.5) calc(var(--unit) * 1) rgb(255 255 255 / 0.9),
    inset 0 0 calc(var(--unit) * 1.5) calc(var(--unit) * 1) rgb(255 255 255 / 0.6);
  color: #4b4d54;
  font-size: calc(var(--unit) * 27);
  font-weight: 600;
  letter-spacing: calc(var(--unit) * 1);
  overflow: hidden;
}

/* Provisional: the white rim a row takes under the pointer or the keyboard's focus, about 4 across and centred on its
   Edge, read off the clip's rows lit one at a time from 176 to 179 seconds. A pointer's hover is guarded by
   `(hover: hover)` and the focus is a child's `:focus-visible`, so a touch screen leaves no rim after a tap or a drag
   That focuses one */
@media (hover: hover) {
  .row:hover {
    box-shadow: var(--lit-shadow);
  }
}

.row:has(:focus-visible) {
  box-shadow: var(--lit-shadow);
}

.label {
  position: absolute;
  top: 50%;
  left: calc(var(--unit) * 29);
  line-height: 1;
  transform: translateY(-50%);
}

.row:has(.choice) {
  background: linear-gradient(
    to right,
    rgb(240 231 215 / 0.78) calc(var(--unit) * 977),
    rgb(240 231 215 / 0) calc(var(--unit) * 977)
  );
}
</style>
