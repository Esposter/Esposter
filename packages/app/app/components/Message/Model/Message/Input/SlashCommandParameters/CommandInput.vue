<script setup lang="ts">
interface SlashCommandParameterCommandInputProps {
  autofocus?: boolean;
}

const { autofocus } = defineProps<SlashCommandParameterCommandInputProps>();
const emit = defineEmits<{
  blur: [];
  delete: [];
  focus: [];
  keydown: [event: KeyboardEvent];
  "navigate:next": [];
}>();
const modelValue = defineModel<string>({ default: "" });
const input = useTemplateRef("input");

defineExpose({ focus: () => input.value?.focus() });
</script>

<template>
  <div inline-flex items-center gap-0.5>
    <span font-bold text-sm opacity-70>/</span>
    <input
      ref="input"
      v-model="modelValue"
      class="command-input"
      bg-transparent
      b-none
      outline-none
      text-sm
      font-bold
      :autofocus
      @focus="emit('focus')"
      @blur="emit('blur')"
      @keydown="emit('keydown', $event)"
      @keydown.enter.prevent="emit('navigate:next')"
      @keydown.space.prevent="emit('navigate:next')"
      @keydown.tab.prevent="emit('navigate:next')"
      @keydown.delete="!modelValue && emit('delete')"
      @keydown.backspace="!modelValue && emit('delete')"
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
.command-input {
  field-sizing: content;
  min-width: 0.5rem;
}
</style>
