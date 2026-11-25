<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { checkIsFileAccepted } from "#src/services/file/checkIsFileAccepted";
import { getFileSize } from "#src/services/file/getFileSize";

interface Props {
  // The file types it takes, as the native input's accept: MIME types, wildcards such as image/*, or extensions
  accept?: string | undefined;
  isMultiple?: true | undefined;
  label: string;
}
// Files picked through the browser's own picker or dropped onto the field. The field is a button that opens the picker,
// Named by its label and described by the files it holds, each with its size. A drop honours accept as the picker
// Does, which the browser leaves to the page
const modelValue = defineModel<File[]>({ required: true });
const { accept, isMultiple } = defineProps<Props>();
const id = useId();
const dropZone = useTemplateRef("dropZone");
const input = useTemplateRef("input");
// A pick or a drop replaces what the field holds only when some of it is accepted, so a choice with none of it leaves
// The field as it was
const takeAccepted = (files: File[]) => {
  const acceptedFiles = files.filter((file) => checkIsFileAccepted(file, accept));
  if (acceptedFiles.length > 0) modelValue.value = acceptedFiles;
};
const { isOverDropZone } = useDropZone(dropZone, {
  multiple: isMultiple,
  onDrop: (files) => takeAccepted(files ?? []),
});
</script>

<template>
  <div flex flex-col gap-1>
    <span :id="`${id}-label`" text-sm text-muted>{{ label }}</span>
    <div ref="dropZone" relative>
      <UiButton
        class="control"
        :aria-describedby="modelValue.length > 0 ? `${id}-files` : undefined"
        :aria-labelledby="`${id}-label`"
        :data-over="isOverDropZone || undefined"
        :variant="UiButtonVariant.Field"
        type="button"
        pr-10
        text-left
        w-full
        justify-start
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
      </UiButton>
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
    <!-- The button is the labelled way in, so the picker's own input stays out of the accessibility tree and the
      tab order -->
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
          if (input?.files) takeAccepted([...input.files]);
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
