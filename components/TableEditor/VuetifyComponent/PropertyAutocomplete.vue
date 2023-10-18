<script setup lang="ts">
import type { VuetifyComponentItem } from "@/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { VuetifyComponentMap } from "@/services/tableEditor/vuetifyComponent/constants";
import { getComponent } from "@/services/tableEditor/vuetifyComponent/getComponent";
import { useTableEditorStore } from "@/store/tableEditor";
import { Constructor } from "type-fest";

const tableEditorStore = useTableEditorStore<VuetifyComponentItem>()();
const { editedItem } = storeToRefs(tableEditorStore);
const propertyRendererMap = ref<Record<string, Component>>({});
const properties = computed(() => Object.keys(propertyRendererMap.value));
const selectedProperty = ref<string>();
const updatePropertyRendererMap = (component: NonNullable<(typeof editedItem)["value"]>["component"]) => {
  const result: Record<string, Component> = {};
  // @TODO: Remove this cast once vuetify/components import is fixed
  const props = VuetifyComponentMap[component as keyof typeof VuetifyComponentMap].props as Record<
    string,
    { type?: Constructor<unknown> | Constructor<unknown>[] }
  >;

  for (const [name, prop] of Object.entries(props).filter((propEntry) => propEntry[1].type))
    if (Array.isArray(prop.type) && prop.type.length > 0) {
      const component = getComponent(prop.type[0]);
      if (component) result[name] = markRaw(component);
    } else {
      const component = getComponent(prop.type as Constructor<unknown>);
      if (component) result[name] = markRaw(component);
    }

  propertyRendererMap.value = result;
};

const { trigger } = watchTriggerable(
  () => editedItem.value?.component,
  (newValue) => {
    if (!newValue) return;
    updatePropertyRendererMap(newValue);
    selectedProperty.value = undefined;
  },
);

onMounted(trigger);
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
