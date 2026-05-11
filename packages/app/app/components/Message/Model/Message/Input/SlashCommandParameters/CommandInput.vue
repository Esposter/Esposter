<script setup lang="ts">
interface CommandInputProps {
  isFocused?: boolean;
}

const { isFocused } = defineProps<CommandInputProps>();
const emit = defineEmits<{
  blur: [];
  delete: [];
  focus: [];
  "navigate:next": [];
}>();
const modelValue = defineModel<string>({ required: true });
const input = useTemplateRef("input");
const { trigger } = watchTriggerable(
  () => isFocused,
  (newIsFocused) => {
    if (newIsFocused) input.value?.focus();
  },
);

onMounted(() => {
  trigger();
});
</script>

<template>
  <div inline-flex gap-0.5 items-center>
    <span text-sm font-bold>/</span>
    <input
      ref="input"
      v-model="modelValue"
      text-sm
      font-bold
      outline-none
      b-none
      bg-transparent
      field-sizing-content
      @focus="emit('focus')"
      @blur="emit('blur')"
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
