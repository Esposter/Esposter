<script setup lang="ts">
import { splitBackgroundLayers } from "@/services/pageBuilder/splitBackgroundLayers";
import { v7 } from "uuid";

interface Layer {
  id: string;
  value: string;
}
interface Props {
  // The background the node inherits while it sets no layer, shown as a note in place of the empty list
  placeholder?: string;
}
// The background-image value, its layers joined by commas. A background's colour is its own field beside the list
const modelValue = defineModel<string>({ required: true });
defineProps<Props>();
// Each layer is keyed by its own id rather than its place, so removing one keeps the unsaved draft of the layers after it
const toLayers = (value: string): Layer[] => splitBackgroundLayers(value).map((layer) => ({ id: v7(), value: layer }));
// An added layer stays in the list until it holds a value, since an empty one joins to nothing
const layers = ref(toLayers(modelValue.value));
const joinLayers = () =>
  layers.value
    .map(({ value }) => value)
    .filter((layer) => layer !== "")
    .join(", ");
const commitLayers = () => {
  modelValue.value = joinLayers();
};
// A change from outside the list re-splits it. The list's own edits already match the value they emit, so they are kept
watch(modelValue, (value) => {
  if (value !== joinLayers()) layers.value = toLayers(value);
});
const setLayer = (id: string, value: string) => {
  layers.value = layers.value.map((layer) => (layer.id === id ? { ...layer, value } : layer));
  commitLayers();
};
const removeLayer = (id: string) => {
  layers.value = layers.value.filter((layer) => layer.id !== id);
  commitLayers();
};
const addLayer = () => {
  layers.value.push({ id: v7(), value: "" });
};
</script>

<template>
  <div flex flex-col gap-2>
    <p v-if="layers.length === 0 && placeholder" text-muted>{{ placeholder }}</p>
    <div v-for="(layer, index) in layers" :key="layer.id" flex gap-2 items-end>
      <PageBuilderStylePanelField
        :label="`Layer ${index + 1}`"
        :model-value="layer.value"
        property="background-image"
        @update:model-value="(value) => setLayer(layer.id, value)"
      />
      <!-- eslint-disable vue/no-restricted-syntax -- removes a layer from the unsaved page draft, which the page builder's undo history restores -->
      <UiButton @click="removeLayer(layer.id)">Remove</UiButton>
      <!-- eslint-enable vue/no-restricted-syntax -->
    </div>
    <UiButton @click="addLayer()">Add a layer</UiButton>
  </div>
</template>
