<script setup lang="ts">
interface ColorSwatch {
  // The custom property's name without its dashes, which a picked swatch stores as a reference to it
  name: string;
  value: string;
}
interface Props {
  label: string;
  // The page's own colours, listed first as swatches; picking one stores a reference to it rather than its colour
  swatches?: ColorSwatch[];
}
// A colour picked with the browser's own picker, which follows the page's colour scheme, shown as a swatch beside the
// Hex value it holds. The swatch is the control, so its label names it
const modelValue = defineModel<string>({ required: true });
const { label, swatches = [] } = defineProps<Props>();
const id = useId();
const getReference = (name: string) => `var(--${name})`;
</script>

<template>
  <!-- The value beside the swatch rather than inside the label, so the label alone names the control -->
  <div flex flex-col gap-2>
    <div v-if="swatches.length > 0" role="group" :aria-label="label" flex flex-wrap gap-1>
      <!-- Pressed wears the button's outline, since the inline colour would hide the accent fill a pressed button takes -->
      <button
        v-for="swatch in swatches"
        :key="swatch.name"
        type="button"
        ui-button
        outline-2
        outline-transparent
        outline-offset-2
        outline-solid
        rd-full
        class="aria-pressed:outline-accent"
        :aria-label="swatch.name"
        :aria-pressed="modelValue === getReference(swatch.name)"
        :style="{ backgroundColor: swatch.value }"
        @click="modelValue = getReference(swatch.name)"
      />
    </div>
    <div flex gap-2 items-end>
      <label :for="id" flex flex-col gap-1>
        <span text-muted>{{ label }}</span>
        <input :id v-model="modelValue" type="color" p-1 size-8 cursor-pointer ui-field />
      </label>
      <code text-muted flex h-8 items-center>{{ modelValue }}</code>
    </div>
  </div>
</template>
