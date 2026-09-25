<script setup lang="ts" generic="T">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  // What a token reads as, which names the button that removes it too
  getTokenTitle: (token: T) => string;
  // The field's accessible name, and its panel's, drawn as the hint inside it while it is empty
  label: string;
}

// A search field that holds tokens before its text — a query's filters — as chips a reader removes one by one, over a
// Panel of what to type next that opens as the field is focused. Backspace in empty text takes the last token back,
// Escape puts the panel away and then leaves the field, and the panel closes once focus is in neither. The panel hangs
// Under the whole field at its width, which the popover's own anchor sizing gives rather than a measured one
defineSlots<{ panel: (props: { focus: () => void }) => VNode }>();
const text = defineModel<string>("text", { required: true });
const tokens = defineModel<T[]>("tokens", { required: true });
const isOpen = defineModel<boolean>("isOpen", { default: false });
const { getTokenTitle, label } = defineProps<Props>();
const emit = defineEmits<{ submit: [] }>();
const container = useTemplateRef("container");
const field = useTemplateRef("field");
const input = useTemplateRef("input");
const { focused: isFocusWithin } = useFocusWithin(container);
const focus = () => {
  input.value?.focus();
};

watch(isFocusWithin, (newIsFocusWithin) => {
  if (!newIsFocusWithin) isOpen.value = false;
});
</script>

<template>
  <!-- Escape in the panel closes it, and the text is where the reader goes back to. Taken on the way down, since the
  Popover's own Escape stops at its panel and hands focus to the field it hangs off, which takes none -->
  <div
    ref="container"
    relative
    @keydown.esc.capture="
      (event: KeyboardEvent) => {
        if (event.target === input) return;
        event.preventDefault();
        event.stopPropagation();
        focus();
        isOpen = false;
      }
    "
  >
    <div
      ref="field"
      class="field"
      px-2
      py-1
      flex
      flex-wrap
      gap-1
      min-h-8
      cursor-text
      items-center
      ui-field
      ui-pill
      @click.self="focus()"
    >
      <UiIcon :meaning="UiIconMeaning.Search" text-muted />
      <UiChip
        v-for="(token, index) of tokens"
        :key="index"
        :remove-label="`Remove ${getTokenTitle(token)}`"
        @remove="
          () => {
            tokens = tokens.toSpliced(index, 1);
            focus();
          }
        "
      >
        {{ getTokenTitle(token) }}
      </UiChip>
      <input
        ref="input"
        v-model="text"
        :aria-label="label"
        :aria-expanded="isOpen"
        aria-haspopup="dialog"
        autocomplete="off"
        :placeholder="tokens.length === 0 ? label : undefined"
        type="text"
        bg-transparent
        flex-1
        min-w-16
        focus-visible:outline-none
        @focus="isOpen = true"
        @input="isOpen = true"
        @keydown.backspace="
          () => {
            if (text || tokens.length === 0) return;
            tokens = tokens.slice(0, -1);
          }
        "
        @keydown.enter.prevent="emit('submit')"
        @keydown.esc="
          () => {
            if (isOpen) isOpen = false;
            else input?.blur();
          }
        "
      />
      <UiIconButton
        v-if="text || tokens.length > 0"
        label="Clear search"
        :meaning="UiIconMeaning.Remove"
        :variant="UiButtonVariant.Quiet"
        ui-pill
        @click="
          () => {
            text = '';
            tokens = [];
            focus();
          }
        "
      />
    </div>
    <UiPopover v-model:is-open="isOpen" :anchor="field ?? undefined" :label>
      <slot name="panel" :focus />
    </UiPopover>
  </div>
</template>

<style scoped>
/* A field the reader is in is tinted as every field is, though its input draws no ring of its own */
.field:focus-within {
  background-color: color-mix(in srgb, var(--ui-tint) 10%, var(--ui-panel));
}
</style>
