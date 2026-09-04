<script setup lang="ts">
import { slashCommandParameterValueSchema } from "@/models/message/slashCommands/SlashCommandParameter";
import { REQUIRED_ERROR_MESSAGE } from "@/services/message/slashCommands/constants";
import { useSlashCommandStore } from "@/store/message/input/slashCommand";
import { checkIsCaretAtEnd } from "@/util/dom/checkIsCaretAtEnd";
import { checkIsCaretAtStart } from "@/util/dom/checkIsCaretAtStart";

interface Props {
  autofocus?: boolean;
  isFocused?: boolean;
  isRequired: boolean;
  name: string;
}

const modelValue = defineModel<string>({ default: "" });
const { isFocused, isRequired, name } = defineProps<Props>();
const emit = defineEmits<{
  blur: [];
  delete: [];
  focus: [];
  "navigate:next": [];
  "navigate:previous": [];
  submit: [];
}>();
const slashCommandStore = useSlashCommandStore();
const { errors } = storeToRefs(slashCommandStore);
const { setErrors } = slashCommandStore;
const input = useTemplateRef("input");
const isError = computed(() => {
  const parameterError = errors.value.find(({ id }) => id === name);
  return Boolean(parameterError && parameterError.messages.length > 0);
});

useFocusWhenActive(input, () => isFocused);
</script>

<template>
  <div
    :class="isError ? ['b-error'] : ['b-border', 'focus-within:b-info']"
    b="[0.09375rem]"
    rd
    b-solid
    bg-border
    inline-flex
    gap-1.5
    items-center
    overflow-hidden
  >
    <!-- The label segment bleeds to the chip edge, so each segment owns its padding rather than
      the root padding it and the label clawing it back with a negative margin -->
    <span
      :class="isError ? 'text-error' : ''"
      font-bold
      py-1
      pl-2
      pr-1
      bg-background
      flex
      items-center
      self-stretch
      text-body-medium
    >
      {{ name }}
    </span>
    <!-- eslint-disable vuejs-accessibility/no-autofocus -- Focus follows the parameter the user just added, the
      same deliberate move a dialog makes on open; without it the chip renders unfocused mid-typing. -->
    <input
      ref="input"
      v-model="modelValue"
      color-inherit
      pr-2
      outline-none
      b-none
      bg-transparent
      field-sizing-content
      text-body-medium
      :autofocus
      @focus="emit('focus')"
      @blur="emit('blur')"
      @update:model-value="
        setErrors(
          name,
          isRequired && !slashCommandParameterValueSchema.safeParse($event).success ? [REQUIRED_ERROR_MESSAGE] : [],
        )
      "
      @keydown.enter.prevent="emit('submit')"
      @keydown.delete="!modelValue && emit('delete')"
      @keydown.left.exact="
        (event) => {
          if (checkIsCaretAtStart(event.target as HTMLInputElement)) {
            event.preventDefault();
            emit('navigate:previous');
          }
        }
      "
      @keydown.right.exact="
        (event) => {
          if (checkIsCaretAtEnd(event.target as HTMLInputElement)) {
            event.preventDefault();
            emit('navigate:next');
          }
        }
      "
    />
    <!-- eslint-enable vuejs-accessibility/no-autofocus -->
  </div>
</template>
