<script setup lang="ts">
import { VuetifyComponent } from "@/models/tableEditor/vuetifyComponent/VuetifyComponent";
import { VuetifyComponentMap } from "@/services/tableEditor/vuetifyComponent/constants";
import { getComponent } from "@/services/tableEditor/vuetifyComponent/getComponent";
import { useTableEditorStore } from "@/store/tableEditor";
import { Constructor } from "type-fest";

const tableEditorStore = useTableEditorStore();
// @NOTE: Fix up this type cast when pinia team fixes type issues
const { editedItem } = storeToRefs(tableEditorStore) as unknown as { editedItem: Ref<VuetifyComponent | null> };
const propertyRendererMap = ref<[string, Component][]>([]);
const updatePropertyRendererMap = (component: NonNullable<(typeof editedItem)["value"]>["component"]) => {
  const result: [string, Component][] = [];
  const props = VuetifyComponentMap[component].props as Record<
    string,
    { type: Constructor<unknown> | Constructor<unknown>[] | undefined }
  >;

  for (const [name, prop] of Object.entries(props).filter((propEntry) => propEntry[1].type)) {
    if (Array.isArray(prop.type) && prop.type.length > 0) result.push([name, markRaw(getComponent(prop.type[0]))]);
    else result.push([name, markRaw(getComponent(prop.type as Constructor<unknown>))]);
  }

  propertyRendererMap.value = result;
};

onMounted(() => {
  if (!editedItem.value) return;
  updatePropertyRendererMap(editedItem.value.component);
});
watch(
  () => editedItem.value?.component,
  (newValue) => {
    if (!newValue) return;
    updatePropertyRendererMap(newValue);
  }
);
</script>

<template>
  <v-container v-if="editedItem">
    <v-row v-for="propertyRenderer in propertyRendererMap" :key="propertyRenderer[0]">
      <v-col>
        {{ propertyRenderer[0] }}
        <component :is="propertyRenderer[1]" v-model="editedItem.props[propertyRenderer[0]]" hide-details />
      </v-col>
    </v-row>
  </v-container>
</template>
