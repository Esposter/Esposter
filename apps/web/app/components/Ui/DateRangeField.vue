<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  label: string;
  // What the field reads while it holds nothing
  placeholder?: string;
}
// A span of days, picked in the library's calendar in its range mode from one field drawn as a select's trigger, which
// Reads the two days with a dash between them. The panel closes once the span has its end, and one button beside the
// Field empties both. Its days are plain dates, so the call site decides which instant each bound means
const from = defineModel<Temporal.PlainDate>("from");
const to = defineModel<Temporal.PlainDate>("to");
const { label, placeholder = "Pick dates" } = defineProps<Props>();
const isOpen = ref(false);
</script>

<template>
  <UiPopoverField
    v-model:is-open="isOpen"
    :is-clearable="Boolean(from || to)"
    :is-empty="!from && !to"
    :label
    :placeholder
    @clear="
      () => {
        from = undefined;
        to = undefined;
      }
    "
  >
    <template #value>
      <NuxtTime v-if="from" :datetime="from.toString()" date-style="medium" time-zone="UTC" />
      –
      <NuxtTime v-if="to" :datetime="to.toString()" date-style="medium" time-zone="UTC" />
    </template>
    <UiCalendar
      v-model:from="from"
      v-model:to="to"
      is-range
      :label
      @update:to="
        (newTo) => {
          if (newTo) isOpen = false;
        }
      "
    />
  </UiPopoverField>
</template>
