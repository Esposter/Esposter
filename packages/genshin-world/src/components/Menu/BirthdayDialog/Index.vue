<script setup lang="ts">
import type { TravelerBirthdaySave } from "#src/models/save/TravelerBirthdaySave";
import type { GameText } from "genshin-text";

import MenuDialog from "#src/components/Menu/Dialog/Index.vue";
import MenuGlyph from "#src/components/Menu/Glyph/Index.vue";
import { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import { MenuFrameGlyphMap } from "#src/services/menu/MenuFrameGlyphMap";
import { BIRTHDAY_MONTHS } from "#src/services/profile/constants";
import { getBirthdayDayCount } from "#src/services/profile/getBirthdayDayCount";
import { GameButton, GameButtonKind } from "genshin-interface";
import { fillGameTextValues, GameTextKey, splitGameTextColors } from "genshin-text";

interface Props {
  gameText: GameText;
}

// Back closes the dialog without setting anything, and Confirm sets the picked date once
const { gameText } = defineProps<Props>();
const emit = defineEmits<{ close: []; confirm: [birthday: TravelerBirthdaySave] }>();
const month = ref<number>();
const day = ref<number>();
const days = computed(() =>
  Array.from(
    { length: month.value === undefined ? 0 : getBirthdayDayCount(month.value) },
    (_value, index) => index + 1,
  ),
);
const birthday = computed<TravelerBirthdaySave | undefined>(() =>
  month.value !== undefined && day.value !== undefined ? { day: day.value, month: month.value } : undefined,
);
// A month that is shorter than the picked day takes the day back, so a date is always one the month holds
const pickMonth = (nextMonth: number) => {
  month.value = nextMonth;
  if (day.value !== undefined && day.value > getBirthdayDayCount(nextMonth)) day.value = undefined;
};
// The confirm line names the date, the twenty-ninth of February with a line of its own, and is coloured as the game colours it
const confirmSegments = computed(() => {
  if (!birthday.value) return [];
  const { day: pickedDay, month: pickedMonth } = birthday.value;
  const tip =
    pickedMonth === 2 && pickedDay === 29
      ? gameText[GameTextKey.BirthdayConfirmLeapDayTip]
      : fillGameTextValues(gameText[GameTextKey.BirthdayConfirmTip], pickedMonth, pickedDay);
  return splitGameTextColors(tip);
});
const confirmBirthday = () => {
  if (birthday.value) emit("confirm", birthday.value);
};
</script>

<template>
  <MenuDialog :title="gameText[GameTextKey.BirthdaySet]">
    <div class="months">
      <GameButton
        v-for="monthChoice of BIRTHDAY_MONTHS"
        :key="monthChoice"
        class="month"
        tip=""
        :aria-pressed="monthChoice === month"
        :kind="GameButtonKind.Row"
        @click="pickMonth(monthChoice)"
      >
        {{ monthChoice }}
      </GameButton>
    </div>
    <div class="days">
      <GameButton
        v-for="dayChoice of days"
        :key="dayChoice"
        class="day"
        tip=""
        :aria-pressed="dayChoice === day"
        :kind="GameButtonKind.Row"
        @click="day = dayChoice"
      >
        {{ dayChoice }}
      </GameButton>
    </div>
    <p v-if="birthday" class="confirm">
      <span v-for="({ color, text }, index) of confirmSegments" :key="index" :style="{ color }">{{ text }}</span>
    </p>
    <p v-if="birthday" class="warning">{{ gameText[GameTextKey.BirthdayConfirmWarning] }}</p>
    <div class="actions">
      <GameButton
        class="confirm-button"
        tip=""
        :disabled="!birthday"
        :kind="GameButtonKind.Pill"
        @click="confirmBirthday()"
      >
        {{ gameText[GameTextKey.Confirm] }}
      </GameButton>
      <GameButton
        class="close"
        tip=""
        :aria-label="gameText[GameTextKey.Back]"
        :kind="GameButtonKind.Plain"
        @click="emit('close')"
      >
        <MenuGlyph :glyph="MenuFrameGlyphMap[MenuFrameIcon.Close]" />
      </GameButton>
    </div>
  </MenuDialog>
</template>

<style scoped>
.months,
.days {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--unit) * 4);
}

.warning {
  margin: 0;
  font-size: calc(var(--unit) * 18);
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
