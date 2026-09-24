<script setup lang="ts" generic="TModel extends Date | null">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";
import { getZonedDateTime } from "@esposter/shared";

interface Props {
  // A field that may be left empty, which draws a button that empties it
  isClearable?: true;
  // A moment rather than a day: the panel takes a time of day under the calendar
  isTime?: true;
  label: string;
  max?: Date;
  min?: Date;
  // What the field reads while it holds nothing
  placeholder?: string;
}

// A day, or a day and a time, picked in the library's calendar from a field drawn as a select's trigger. What it holds
// Is an instant, read and written in the reader's own time zone, so the day a reader picks is the day they see. A day
// Is chosen and the panel closes; with a time the panel stays open for it, and Done closes it
const modelValue = defineModel<TModel>({ required: true });
const { isClearable, isTime, label, max, min, placeholder = "Pick a date" } = defineProps<Props>();
const isOpen = ref(false);
const valueId = useId();
const zonedDateTime = computed(() => (modelValue.value ? getZonedDateTime(modelValue.value) : undefined));
const minZonedDateTime = computed(() => (min ? getZonedDateTime(min) : undefined));
const maxZonedDateTime = computed(() => (max ? getZonedDateTime(max) : undefined));
const time = computed({
  get: () => zonedDateTime.value?.toPlainTime().toString({ smallestUnit: "minute" }) ?? "",
  set: (value) => {
    if (!value || !zonedDateTime.value) return;
    choose(zonedDateTime.value.withPlainTime(Temporal.PlainTime.from(value)));
  },
});
// A moment before the earliest or after the latest is moved onto it, so a day picked on the earliest one's own day
// Still lands after its time
const choose = (newZonedDateTime: Temporal.ZonedDateTime) => {
  let clampedZonedDateTime = newZonedDateTime;
  if (minZonedDateTime.value && Temporal.ZonedDateTime.compare(clampedZonedDateTime, minZonedDateTime.value) < 0)
    clampedZonedDateTime = minZonedDateTime.value;
  else if (maxZonedDateTime.value && Temporal.ZonedDateTime.compare(clampedZonedDateTime, maxZonedDateTime.value) > 0)
    clampedZonedDateTime = maxZonedDateTime.value;
  modelValue.value = new Date(clampedZonedDateTime.epochMilliseconds) as TModel;
};
// A new day keeps the time already chosen, or the current one's to the minute when there is none yet
const chooseDate = (date: Temporal.PlainDate) => {
  const plainTime = zonedDateTime.value?.toPlainTime() ?? Temporal.Now.plainTimeISO().round({ smallestUnit: "minute" });
  choose(date.toZonedDateTime({ plainTime, timeZone: Temporal.Now.timeZoneId() }));
  if (!isTime) isOpen.value = false;
};
// A template cannot see a language global, so today is read here
const chooseToday = () => {
  chooseDate(Temporal.Now.plainDateISO());
};
</script>

<template>
  <div flex flex-col gap-1>
    <span text-sm text-muted>{{ label }}</span>
    <div flex gap-1 items-center>
      <UiPopover
        v-model:is-open="isOpen"
        :aria-describedby="valueId"
        :label
        :variant="UiButtonVariant.Field"
        justify-start
        flex-1
      >
        <template #trigger>
          <UiIcon :meaning="UiIconMeaning.Date" text-muted />
          <span :id="valueId" :class="{ 'text-muted': !modelValue }" text-left flex-1 truncate>
            <NuxtTime
              v-if="modelValue"
              :datetime="modelValue"
              date-style="medium"
              :time-style="isTime ? 'short' : undefined"
            />
            <template v-else>{{ placeholder }}</template>
          </span>
        </template>
        <UiCalendar
          :label
          :max="maxZonedDateTime?.toPlainDate()"
          :min="minZonedDateTime?.toPlainDate()"
          :model-value="zonedDateTime?.toPlainDate()"
          @update:model-value="
            (value) => {
              if (value) chooseDate(value);
            }
          "
        />
        <UiTextField
          v-if="isTime"
          v-model="time"
          :is-disabled="!modelValue || undefined"
          label="Time"
          :type="UiTextFieldType.Time"
        />
        <footer flex gap-2 justify-end>
          <UiButton :variant="UiButtonVariant.Quiet" @click="chooseToday()">Today</UiButton>
          <UiButton v-if="isTime" :variant="UiButtonVariant.Accent" @click="isOpen = false">Done</UiButton>
        </footer>
      </UiPopover>
      <UiIconButton
        v-if="isClearable && modelValue"
        :label="`Clear ${label}`"
        :meaning="UiIconMeaning.Remove"
        :variant="UiButtonVariant.Quiet"
        @click="modelValue = null as TModel"
      />
    </div>
  </div>
</template>
