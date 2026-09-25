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
const valueId = useId();
</script>

<template>
  <div flex flex-col gap-1>
    <span text-sm text-muted>{{ label }}</span>
    <div flex gap-1 items-center>
      <UiPopover
        v-model:is-open="isOpen"
        :aria-describedby="valueId"
        is-label-shown
        :label
        :variant="UiButtonVariant.Field"
        flex-1
        justify-start
      >
        <template #trigger>
          <UiIcon :meaning="UiIconMeaning.Date" text-muted />
          <span :id="valueId" :class="{ 'text-muted': !from && !to }" text-left flex-1 truncate>
            <template v-if="from || to">
              <NuxtTime v-if="from" :datetime="from.toString()" date-style="medium" time-zone="UTC" />
              –
              <NuxtTime v-if="to" :datetime="to.toString()" date-style="medium" time-zone="UTC" />
            </template>
            <template v-else>{{ placeholder }}</template>
          </span>
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
      </UiPopover>
      <UiIconButton
        v-if="from || to"
        :label="`Clear ${label}`"
        :meaning="UiIconMeaning.Remove"
        :variant="UiButtonVariant.Quiet"
        @click="
          () => {
            from = undefined;
            to = undefined;
          }
        "
      />
    </div>
  </div>
</template>
