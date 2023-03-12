<script setup lang="ts">
import { VuetifyComponent } from "@/models/tableEditor/vuetifyComponent/VuetifyComponent";
import { getComponent } from "@/services/tableEditor/vuetifyComponent/getComponent";
import { VuetifyComponentMap } from "@/services/vuetify/constants";
import { useTableEditorStore } from "@/store/tableEditor";
import { Constructor } from "type-fest";

const tableEditorStore = useTableEditorStore();
// @NOTE: Fix up this type cast when pinia team fixes type issues
const { editedItem } = storeToRefs(tableEditorStore) as unknown as { editedItem: Ref<VuetifyComponent | null> };
const typePropertyRendererMap = ref<[string, Component][]>([]);
const updateTypePropertyRendererMap = (component: NonNullable<(typeof editedItem)["value"]>["component"]) => {
  const result: [string, Component][] = [];
  const props = VuetifyComponentMap[component].props as Record<
    string,
    { type: Constructor<unknown> | Constructor<unknown>[] | undefined }
  >;

  for (const [name, prop] of Object.entries(props).filter((propEntry) => propEntry[1].type)) {
    if (Array.isArray(prop.type) && prop.type.length > 0) result.push([name, markRaw(getComponent(prop.type[0]))]);
    else result.push([name, markRaw(getComponent(prop.type as Constructor<unknown>))]);
  }

  typePropertyRendererMap.value = result;
};

onMounted(() => {
  if (!editedItem.value) return;
  updateTypePropertyRendererMap(editedItem.value.component);
});
watch(
  () => editedItem.value?.component,
  (newValue) => {
    if (!newValue) return;
    updateTypePropertyRendererMap(newValue);
  }
);
</script>

<template>
  <v-container max-h="70vh" overflow-y="auto">
    <v-row v-for="typePropertyRenderer in typePropertyRendererMap" :key="typePropertyRenderer[0]">
      <v-col>
        {{ typePropertyRenderer[0] }}
        <component :is="typePropertyRenderer[1]" hide-details />
      </v-col>
    </v-row>
  </v-container>
</template>
