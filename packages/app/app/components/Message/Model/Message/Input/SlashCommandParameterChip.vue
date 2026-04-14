<script setup lang="ts">
interface SlashCommandParameterChipProps {
  autofocus?: boolean;
  isRequired: boolean;
  isSubmitAttempted?: boolean;
  name: string;
}

const { isRequired, isSubmitAttempted, name } = defineProps<SlashCommandParameterChipProps>();
const emit = defineEmits<{ remove: []; submit: [] }>();
const modelValue = defineModel<string>({ default: "" });
const isFocused = ref(false);
const isTouched = ref(false);
const isError = computed(
  () => (isTouched.value || Boolean(isSubmitAttempted)) && isRequired && !modelValue.value.trim(),
);
</script>

<template>
  <div class="parameter-chip" :class="{ 'parameter-chip--error': isError, 'parameter-chip--focused': isFocused }">
    <span class="chip-label bg-background" :class="isError ? 'text-error' : ''" font-bold text-sm>{{ name }}</span>
    <input
      v-model="modelValue"
      class="chip-input"
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
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 4px;
  border: 1.5px solid rgba(var(--v-border-color), var(--v-border-opacity));
  padding: 4px 2px 4px 8px;

  &--focused {
    border-color: rgb(var(--v-theme-primary));
  }

  &--error {
    border-color: rgb(var(--v-theme-error));
  }

  .chip-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-size: 0.875rem;
  }
}
</style>
