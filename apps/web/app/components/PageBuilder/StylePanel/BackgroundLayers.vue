<script setup lang="ts">
import { splitBackgroundLayers } from "@/services/pageBuilder/splitBackgroundLayers";

interface Props {
  // The background the node inherits while it sets no layer, shown as a note in place of the empty list
  placeholder?: string;
}

// The background-image value, its layers joined by commas. A background's colour is its own field beside the list
const modelValue = defineModel<string>({ required: true });
const { placeholder } = defineProps<Props>();
// An added layer stays in the list until it holds a value, since an empty one joins to nothing
const layers = ref(splitBackgroundLayers(modelValue.value));
const joinLayers = () => layers.value.filter((layer) => layer !== "").join(", ");
const commitLayers = () => {
  modelValue.value = joinLayers();
};
// A change from outside the list re-splits it. The list's own edits already match the value they emit, so they are kept
watch(modelValue, (value) => {
  if (value !== joinLayers()) layers.value = splitBackgroundLayers(value);
});
const setLayer = (index: number, value: string) => {
  layers.value[index] = value;
  commitLayers();
};
const removeLayer = (index: number) => {
  layers.value = layers.value.toSpliced(index, 1);
  commitLayers();
};
const addLayer = () => {
  layers.value.push("");
};
</script>

<template>
  <div flex flex-col gap-2>
    <p v-if="layers.length === 0 && placeholder" text-muted>{{ placeholder }}</p>
    <div v-for="(layer, index) in layers" :key="index" flex gap-2 items-end>
      <PageBuilderStylePanelField
        :label="`Layer ${index + 1}`"
        :model-value="layer"
        property="background-image"
        @update:model-value="(value) => setLayer(index, value)"
      />
      <!-- eslint-disable vue/no-restricted-syntax -- removes a layer from the unsaved page draft, which the page builder's undo history restores -->
      <UiButton @click="removeLayer(index)">Remove</UiButton>
      <!-- eslint-enable vue/no-restricted-syntax -->
    </div>
    <UiButton @click="addLayer()">Add a layer</UiButton>
  </div>
</template>
