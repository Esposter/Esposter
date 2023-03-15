<script setup lang="ts">
import { VuetifyComponent } from "@/models/tableEditor/vuetifyComponent/VuetifyComponent";
import { VuetifyComponentMap } from "@/services/tableEditor/vuetifyComponent/constants";
import { getComponent } from "@/services/tableEditor/vuetifyComponent/getComponent";
import { useTableEditorStore } from "@/store/tableEditor";
import { Constructor } from "type-fest";

const tableEditorStore = useTableEditorStore();
// @NOTE: Fix up this type cast when pinia team fixes type issues
const { editedItem } = storeToRefs(tableEditorStore) as unknown as { editedItem: Ref<VuetifyComponent | null> };
const propertyRendererMap = ref<Record<string, Component>>({});
const properties = computed(() => Object.keys(propertyRendererMap.value));
const selectedProperty = ref<string | null>(null);
const updatePropertyRendererMap = (component: NonNullable<(typeof editedItem)["value"]>["component"]) => {
  const result: Record<string, Component> = {};
  const props = VuetifyComponentMap[component].props as Record<
    string,
    { type: Constructor<unknown> | Constructor<unknown>[] | undefined }
  >;

  for (const [name, prop] of Object.entries(props).filter((propEntry) => propEntry[1].type)) {
    if (Array.isArray(prop.type) && prop.type.length > 0) result[name] = markRaw(getComponent(prop.type[0]));
    else result[name] = markRaw(getComponent(prop.type as Constructor<unknown>));
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
    selectedProperty.value = null;
  }
);
</script>

<template>
  <template v-if="editedItem">
    <v-col cols="12">
      <v-autocomplete v-model="selectedProperty" label="Property" :items="properties" />
    </v-col>
    <v-col v-if="selectedProperty">
      <component
        :is="propertyRendererMap[selectedProperty]"
        v-model="editedItem.props[selectedProperty]"
        label="Property Value"
        hide-details
      />
    </v-col>
  </template>
</template>
