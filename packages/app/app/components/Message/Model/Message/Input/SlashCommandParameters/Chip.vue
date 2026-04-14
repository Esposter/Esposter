<script setup lang="ts">
import { useSlashCommandStore } from "@/store/message/input/slashCommand";

interface SlashCommandParameterChipProps {
  autofocus?: boolean;
  isRequired: boolean;
  name: string;
}

const modelValue = defineModel<string>({ default: "" });
const { isRequired, name } = defineProps<SlashCommandParameterChipProps>();
const emit = defineEmits<{ delete: []; "navigate:next": []; "navigate:previous": []; submit: [] }>();
const slashCommandStore = useSlashCommandStore();
const { errors } = storeToRefs(slashCommandStore);
const { setErrors } = slashCommandStore;
const input = useTemplateRef("input");
const isError = computed(() => Boolean(errors.value.find((e) => e.id === name)?.messages.length));

defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
  <div
    class="parameter-chip bg-border"
    :class="{ 'parameter-chip--error': isError }"
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
      ref="input"
      v-model="modelValue"
      class="parameter-chip__input"
      bg-transparent
      b-none
      outline-none
      text-sm
      :autofocus
      @update:model-value="setErrors(name, isRequired && !$event.trim() ? [`${name} is required`] : [])"
      @keydown.enter.prevent="emit('submit')"
      @keydown.delete="!modelValue && emit('delete')"
      @keydown.left.exact="
        (event) => {
          const target = event.target as HTMLInputElement;
          if (target.selectionStart === 0 && target.selectionEnd === 0) {
            event.preventDefault();
            emit('navigate:previous');
          }
        }
      "
      @keydown.right.exact="
        (event) => {
          const target = event.target as HTMLInputElement;
          if (target.selectionStart === target.value.length && target.selectionEnd === target.value.length) {
            event.preventDefault();
            emit('navigate:next');
          }
        }
      "
    />
  </div>
</template>

<style scoped lang="scss">
.parameter-chip {
  border: 1.5px solid rgba(var(--v-border-color), var(--v-border-opacity));

  &:focus-within {
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
