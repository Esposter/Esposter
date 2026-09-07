<script setup lang="ts">
import { checkIsCaretAtEnd } from "@/util/dom/checkIsCaretAtEnd";

interface Props {
  isFocused?: boolean;
}

const { isFocused } = defineProps<Props>();
const emit = defineEmits<{
  blur: [];
  delete: [];
  focus: [];
  "navigate:next": [];
}>();
const modelValue = defineModel<string>({ required: true });
const input = useTemplateRef("input");

useFocusWhenActive(input, () => isFocused);
</script>

<template>
  <div inline-flex gap-0.5 items-center>
    <span font-bold text-body-medium>/</span>
    <input
      ref="input"
      v-model="modelValue"
      font-bold
      outline-none
      b-none
      bg-transparent
      field-sizing-content
      text-body-medium
      @focus="emit('focus')"
      @blur="emit('blur')"
      @keydown.enter.prevent="emit('navigate:next')"
      @keydown.space.prevent="emit('navigate:next')"
      @keydown.tab.prevent="emit('navigate:next')"
      @keydown.delete="!modelValue && emit('delete')"
      @keydown.right.exact="
        (event) => {
          if (checkIsCaretAtEnd(event.target as HTMLInputElement)) {
            event.preventDefault();
            emit('navigate:next');
          }
        }
      "
    />
  </div>
</template>
