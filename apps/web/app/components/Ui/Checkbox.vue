<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { Checkbox } from "@vuetify/v0";

interface Props {
  // The label drawn beside the box; a box in a row of a table is named by its label alone
  isLabelShown?: true;
  // Some of what it stands for is checked and some is not, as a select-all over part of a list
  isMixed?: true;
  // Its accessible name, and the text beside the box where it is shown
  label: string;
}
// An outlined box the tick draws into from its start while it is checked, and a bar while it is mixed — the same
// Success glyph every "done" in the app wears, never a mark of its own. What a call site passes goes to the element,
// Which is the checkbox itself
defineOptions({ inheritAttrs: false });
const modelValue = defineModel<boolean>({ required: true });
const { isLabelShown, isMixed, label } = defineProps<Props>();
</script>

<template>
  <Checkbox.Root #default="{ attrs }" v-model="modelValue" :indeterminate="isMixed" :label renderless>
    <button :="{ ...attrs, ...$attrs }" type="button" flex gap-2 cursor-pointer items-center group>
      <span
        class="box"
        :data-state="attrs['data-state']"
        flex
        shrink-0
        size-6
        ui-field
        group-hover:[background-image:var(--ui-hover-overlay)]
        group-active:[background-image:var(--ui-pressed-overlay)]
      >
        <UiIcon class="mark" :meaning="isMixed ? UiIconMeaning.Mixed : UiIconMeaning.Success" />
      </span>
      <span v-if="isLabelShown">{{ label }}</span>
    </button>
  </Checkbox.Root>
</template>

<style scoped>
/* The outline is inset so it takes no room from the glyph, and turns the accent once the box holds a mark */
.box {
  box-shadow: inset 0 0 0 var(--ui-border-width) var(--ui-border);
  transition: box-shadow var(--ui-motion-short);
}

.box:is([data-state="checked"], [data-state="indeterminate"]) {
  box-shadow: inset 0 0 0 var(--ui-border-width) var(--ui-accent);
}

/* The mark is drawn from its start, as a pen would, and is simply there on a box that renders checked */
.mark {
  color: var(--ui-accent);
  clip-path: inset(0 100% 0 0);
  transition: clip-path var(--ui-motion-medium);
}

.box:is([data-state="checked"], [data-state="indeterminate"]) .mark {
  clip-path: inset(0);
}

/* A pointer over an empty box previews the tick in the muted colour, so what a press does is seen before it is done */
button:hover .box[data-state="unchecked"] .mark {
  color: var(--ui-muted);
  clip-path: inset(0);
}
</style>
