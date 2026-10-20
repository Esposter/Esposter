<script setup lang="ts">
import { PageBuilderDevice } from "#shared/models/pageBuilder/PageBuilderDevice";
import { usePageBuilderCanvasStore } from "@/store/pageBuilder/canvas";

interface Props {
  resourceId: string;
}

const { resourceId } = defineProps<Props>();
const pageBuilderCanvasStore = usePageBuilderCanvasStore();
const { getDevice, setDevice } = pageBuilderCanvasStore;
const device = computed({ get: () => getDevice(resourceId), set: (value) => setDevice(resourceId, value) });
const items = [
  { title: "Desktop", value: PageBuilderDevice.Desktop },
  { title: "Tablet", value: PageBuilderDevice.Tablet },
  { title: "Mobile", value: PageBuilderDevice.Mobile },
];
</script>

<template>
  <UiToggleGroup v-model="device" :items label="Device" />
</template>
