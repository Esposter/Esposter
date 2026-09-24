<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getFileSize } from "@/services/file/getFileSize";

interface Props {
  // The file types it takes, as the native input's accept: MIME types, wildcards such as image/*, or extensions
  accept?: string;
  isMultiple?: true;
  label: string;
}

// Files picked through the browser's own picker or dropped onto the field. The field is a button that opens the picker,
// Named by its label and described by the files it holds, each with its size. A drop honours accept as the picker
// Does, which the browser leaves to the page
const modelValue = defineModel<File[]>({ required: true });
const { accept, isMultiple, label } = defineProps<Props>();
const id = useId();
const dropZone = useTemplateRef("dropZone");
const input = useTemplateRef("input");
const acceptTokens = computed(() => accept?.split(",").map((token) => token.trim().toLowerCase()) ?? []);
const checkIsAccepted = ({ name, type }: File) =>
  acceptTokens.value.length === 0 ||
  acceptTokens.value.some((token) => {
    if (token.startsWith(".")) return name.toLowerCase().endsWith(token);
    else if (token.endsWith("/*")) return type.startsWith(token.slice(0, -1));
    else return type === token;
  });
const { isOverDropZone } = useDropZone(dropZone, {
  multiple: isMultiple,
  onDrop: (files) => {
    const acceptedFiles = files?.filter((file) => checkIsAccepted(file)) ?? [];
    if (acceptedFiles.length > 0) modelValue.value = acceptedFiles;
  },
});
</script>

<template>
  <div flex flex-col gap-1>
    <span :id="`${id}-label`" text-sm text-muted>{{ label }}</span>
    <div ref="dropZone" relative>
      <button
        class="control"
        :aria-describedby="modelValue.length > 0 ? `${id}-files` : undefined"
        :aria-labelledby="`${id}-label`"
        :data-over="isOverDropZone || undefined"
        type="button"
        ui-row
        pr-10
        cursor-pointer
        ui-field
        @click="input?.click()"
      >
        <UiIcon :meaning="UiIconMeaning.Attach" text-muted />
        <span v-if="modelValue.length === 0" text-muted>
          {{ isMultiple ? "Choose or drop files" : "Choose or drop a file" }}
        </span>
        <span v-else :id="`${id}-files`" flex-1 min-w-0 truncate>
          <template v-for="({ name, size }, index) of modelValue" :key="index">
            {{ index > 0 ? ", " : "" }}{{ name }} <span text-muted>{{ getFileSize(size) }}</span>
          </template>
        </span>
      </button>
      <UiIconButton
        v-if="modelValue.length > 0"
        :label="`Clear ${label}`"
        :meaning="UiIconMeaning.Remove"
        :variant="UiButtonVariant.Quiet"
        right-0
        top-0
        absolute
        @click="
          () => {
            modelValue = [];
            if (input) input.value = '';
          }
        "
      />
    </div>
    <!-- The button is the labelled way in, so the picker's own input stays out of the accessibility tree and the tab order -->
    <input
      ref="input"
      :accept
      :multiple="isMultiple"
      aria-hidden="true"
      tabindex="-1"
      type="file"
      hidden
      @change="
        () => {
          if (input?.files) modelValue = [...input.files].filter((file) => checkIsAccepted(file));
        }
      "
    />
  </div>
</template>

<style scoped>
/* Files held over the field tint it in the accent, where they will land */
.control[data-over] {
  background-color: color-mix(in srgb, var(--ui-accent) 12%, var(--ui-panel));
}
</style>
