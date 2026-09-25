<script setup lang="ts">
import type { UiSchemaFormRendererProps } from "@/models/ui/UiSchemaFormRendererProps";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { composePaths, createDefaultValue, findUISchema, getFirstPrimitiveProp } from "@jsonforms/core";
import { useJsonFormsArrayControl } from "@jsonforms/vue";

interface Props extends UiSchemaFormRendererProps {}

// JSON Forms derives whether a field is enabled or read only when the form leaves them unset, which a boolean prop
// Would read as false
const props = withDefaults(defineProps<Props>(), { enabled: undefined, readonly: undefined });
const { addItem, control, moveDown, moveUp, removeItems } = useJsonFormsArrayControl(props);
const items = computed<unknown[]>(() => control.value.data ?? []);
const isMaxItems = computed(() => items.value.length >= (control.value.arraySchema.maxItems ?? Infinity));
const isMinItems = computed(() => items.value.length <= (control.value.arraySchema.minItems ?? 0));
const childUiSchema = computed(() =>
  findUISchema(
    control.value.uischemas,
    control.value.schema,
    control.value.uischema.scope,
    control.value.path,
    undefined,
    control.value.uischema,
    control.value.rootSchema,
  ),
);
// An item reads as its first string or number, a math variable as its name, until it holds one
const labelId = useId();
const labelKey = computed(() => getFirstPrimitiveProp(control.value.schema));
const getItemLabel = (item: unknown, index: number) => {
  const value = labelKey.value && item && typeof item === "object" ? Reflect.get(item, labelKey.value) : undefined;
  return value === undefined || value === "" ? `${control.value.label} ${index + 1}` : String(value);
};
</script>

<!-- A list of a schema form: each item a card of its own fields, moved and removed from its header, and added at the
  End from the list's own. An item has no identity of its own to key by, so only an added one moves in: keyed by
  Position, a removal would animate the last card out rather than the removed one -->
<template>
  <div v-if="control.visible" role="group" :aria-labelledby="labelId" flex flex-col gap-2>
    <div flex gap-2 items-center>
      <span :id="labelId" text-heading-color flex-1 truncate>{{ control.label }}</span>
      <UiIconButton
        :disabled="!control.enabled || isMaxItems"
        :label="`Add ${control.label}`"
        :meaning="UiIconMeaning.Create"
        :variant="UiButtonVariant.Quiet"
        @click="addItem(control.path, createDefaultValue(control.schema, control.rootSchema))()"
      />
    </div>
    <TransitionGroup name="item" tag="div" flex flex-col gap-2>
      <div v-for="(item, index) of items" :key="index" p-3 flex flex-col gap-3 ui-frame>
        <div flex gap-1 items-center>
          <span flex-1 truncate>{{ getItemLabel(item, index) }}</span>
          <UiIconButton
            :disabled="!control.enabled || index === 0"
            :label="`Move ${getItemLabel(item, index)} up`"
            :meaning="UiIconMeaning.ArrowUp"
            :variant="UiButtonVariant.Quiet"
            @click="moveUp?.(control.path, index)()"
          />
          <UiIconButton
            :disabled="!control.enabled || index === items.length - 1"
            :label="`Move ${getItemLabel(item, index)} down`"
            :meaning="UiIconMeaning.ArrowDown"
            :variant="UiButtonVariant.Quiet"
            @click="moveDown?.(control.path, index)()"
          />
          <UiIconButton
            :disabled="!control.enabled || isMinItems"
            :label="`Remove ${getItemLabel(item, index)}`"
            :meaning="UiIconMeaning.Delete"
            :variant="UiButtonVariant.Quiet"
            @click="removeItems?.(control.path, [index])()"
          />
        </div>
        <UiSchemaFormDispatch
          :cells="control.cells"
          :enabled="control.enabled"
          :path="composePaths(control.path, String(index))"
          :renderers="control.renderers"
          :schema="control.schema"
          :uischema="childUiSchema"
        />
      </div>
    </TransitionGroup>
    <p v-if="items.length === 0" text-muted>Nothing added yet.</p>
  </div>
</template>

<style scoped>
.item-enter-active {
  transition:
    opacity var(--ui-motion-medium),
    translate var(--ui-motion-medium);
}

.item-enter-from {
  opacity: 0;
  translate: 0 calc(var(--ui-step) * -2);
}
</style>
