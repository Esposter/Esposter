<script setup lang="ts">
interface SlashCommandParameterCommandInputProps {
  autofocus?: boolean;
}

const { autofocus } = defineProps<SlashCommandParameterCommandInputProps>();
const emit = defineEmits<{
  blur: [];
  focus: [];
  keydown: [event: KeyboardEvent];
  "navigate:next": [];
  remove: [];
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
      @keydown.delete="!modelValue && emit('remove')"
      @keydown.backspace="!modelValue && emit('remove')"
      @keydown.right.exact="
        (event) => {
          const target = event.target as HTMLInputElement;
          if (target.selectionStart === target.value.length) {
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
