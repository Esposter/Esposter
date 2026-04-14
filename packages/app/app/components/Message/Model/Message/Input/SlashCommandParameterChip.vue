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
    class="parameter-chip bg-border"
    :class="{ 'parameter-chip--error': isError, 'parameter-chip--focused': isFocused }"
    inline-flex
    items-center
    gap-1.5
    rd
    py-1
    px-2
    overflow-hidden
  >
    <span class="parameter-chip__label bg-background" font-bold text-sm :class="isError ? 'text-error' : ''">
      {{ name }}
    </span>
    <input
      v-model="modelValue"
      class="parameter-chip__input"
      bg-transparent
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
      @keydown.delete="!modelValue && emit('remove')"
    />
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

  &__label {
    align-self: stretch;
    display: flex;
    align-items: center;
    margin: -0.25rem 0 -0.25rem -0.5rem;
    padding: 0.25rem 0.25rem 0.25rem 0.5rem;
  }

  &__input {
    field-sizing: content;
    min-width: 4rem;
  }
}
</style>
