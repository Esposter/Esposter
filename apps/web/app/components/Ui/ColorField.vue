<script setup lang="ts">
import { readBrowserColor } from "@/services/shared/readBrowserColor";
import { DEFAULT_PICKER_COLOR, HEX_COLOR_REGEX } from "@/services/ui/constants";
import { getHexColor } from "@/services/ui/getHexColor";

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
// Mounted on the client only: the browser reads a colour off the document, which a server render does not have
const isMounted = useMounted();
const getReference = (name: string) => `var(--${name})`;
// The browser's picker holds a hex colour and no reference, so a held reference shows the colour of the swatch it names
// Any other colour is read by the browser that draws it, and the picker shows the default where it cannot read it
const pickerValue = computed({
  get: () => {
    const cssColor = swatches.find(({ name }) => getReference(name) === modelValue.value)?.value ?? modelValue.value;
    if (HEX_COLOR_REGEX.test(cssColor)) return cssColor;

    const srgbColor = isMounted.value ? readBrowserColor(cssColor) : undefined;
    return srgbColor ? getHexColor(srgbColor) : DEFAULT_PICKER_COLOR;
  },
  set: (value) => {
    modelValue.value = value;
  },
});
</script>

<template>
  <!-- The value beside the swatch rather than inside the label, so the label alone names the control -->
  <div flex flex-col gap-2>
    <div v-if="swatches.length > 0" role="group" :aria-label="label" flex flex-wrap gap-1>
      <!-- Pressed is an accent line inside the swatch, since the inline colour would hide the accent fill a pressed button
      takes. Its focus ring sits outside, so the two never share a place -->
      <button
        v-for="swatch in swatches"
        :key="swatch.name"
        type="button"
        ui-button
        ui-ring-outside
        rd-full
        size-6
        class="aria-pressed:ui-selected"
        :aria-label="swatch.name"
        :aria-pressed="modelValue === getReference(swatch.name)"
        :style="{ backgroundColor: swatch.value }"
        @click="modelValue = getReference(swatch.name)"
      />
    </div>
    <div flex gap-2 items-end>
      <label :for="id" flex flex-col gap-1>
        <span text-muted>{{ label }}</span>
        <input :id v-model="pickerValue" type="color" p-1 size-8 cursor-pointer ui-field />
      </label>
      <code text-muted flex h-8 items-center>{{ modelValue }}</code>
    </div>
  </div>
</template>
