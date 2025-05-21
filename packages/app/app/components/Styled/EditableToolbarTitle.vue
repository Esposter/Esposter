<script setup lang="ts">
import { ROOM_NAME_MAX_LENGTH } from "#shared/services/esbabbler/constants";
import { formRules } from "@/services/vuetify/formRules";

interface EditableToolbarTitleProps {
  initialValue: string;
}

defineSlots<{ default?: (props: Record<string, never>) => unknown }>();
const { initialValue } = defineProps<EditableToolbarTitleProps>();
const emit = defineEmits<{ update: [value: string, onComplete: () => void] }>();
const editedValue = ref(initialValue);
const form = useTemplateRef("form");
const isValid = ref(true);
const isUpdateMode = ref(false);
const titleHovered = ref(false);
const { text } = useColors();
const borderColor = computed(() => (!isUpdateMode.value && titleHovered.value ? text.value : "transparent"));
const onUpdate = () => {
  if (!isValid.value) {
    isUpdateMode.value = false;
    editedValue.value = initialValue;
    return;
  }

  emit("update", editedValue.value, () => {
    isUpdateMode.value = false;
  });
};

onClickOutside(form, () => {
  if (!isUpdateMode.value) return;
  onUpdate();
});
</script>

<template>
  <div flex items-center :py-2="isUpdateMode ? '' : undefined" :w-full="isUpdateMode ? '' : undefined">
    <template v-if="isUpdateMode">
      <v-form ref="form" v-model="isValid" flex-1 @submit.prevent="onUpdate">
        <v-text-field
          v-model="editedValue"
          density="compact"
          font-bold
          autofocus
          text-xl
          :rules="[
            formRules.required,
            formRules.requireAtMostNCharacters(ROOM_NAME_MAX_LENGTH),
            formRules.isNotEqual(initialValue),
            formRules.isNotProfanity,
          ]"
          @keydown.esc="isUpdateMode = false"
        />
      </v-form>
    </template>
    <v-toolbar-title
      v-else
      class="custom-border"
      font-bold
      rd
      select-all
      @click="
        () => {
          isUpdateMode = true;
          titleHovered = false;
        }
      "
      @mouseenter="titleHovered = true"
      @mouseleave="titleHovered = false"
    >
      {{ initialValue }}
    </v-toolbar-title>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.custom-border {
  border: $border-width-root $border-style-root v-bind(borderColor);
}
</style>
