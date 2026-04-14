<script setup lang="ts">
interface SlashCommandParameterChipProps {
  autofocus?: boolean;
  isRequired: boolean;
  isSubmitAttempted: boolean;
  name: string;
}

const { isRequired, isSubmitAttempted, name } = defineProps<SlashCommandParameterChipProps>();
const emit = defineEmits<{ remove: []; submit: [] }>();
const modelValue = defineModel<string>({ default: "" });
const isFocused = ref(false);
const isTouched = ref(false);
const isError = computed(() => (isTouched.value || isSubmitAttempted) && isRequired && !modelValue.value.trim());
</script>

<template>
  <div
    class="parameter-chip"
    :class="{ 'parameter-chip--error': isError, 'parameter-chip--focused': isFocused }"
    inline-flex
    items-center
    gap-1.5
    rd
    py-1
    pr-0.5
    pl-2
  >
    <span class="bg-background" font-bold text-sm :class="isError ? 'text-error' : ''">{{ name }}</span>
    <input
      v-model="modelValue"
      flex-1
      b-none
      outline-none
      text-sm
      :autofocus
      @focus="isFocused = true"
      @blur="
        {
          isFocused = false;
          isTouched = true;
        }
      "
      @keydown.enter.prevent="emit('submit')"
    />
    <v-btn icon="mdi-close" size="x-small" density="compact" variant="text" @click="emit('remove')" />
  </div>
</template>

<style scoped lang="scss">
.parameter-chip {
  border: 1.5px solid rgba(var(--v-border-color), var(--v-border-opacity));

  &--focused {
    border-color: rgb(var(--v-theme-primary));
  }

  &--error {
    border-color: rgb(var(--v-theme-error));
  }
}
</style>
