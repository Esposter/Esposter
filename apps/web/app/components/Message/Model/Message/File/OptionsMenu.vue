<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { downloadUrl } from "@/services/app/downloadUrl";

interface Props {
  filename: string;
  url: string;
}

const { filename, url } = defineProps<Props>();
const emit = defineEmits<{ delete: [] }>();
</script>

<!-- An attachment's own actions, over its corner. They sit over the picture, so they take the raised default rather than
     the quiet look, which would not read over it, and a press stops at them rather than opening the viewer -->
<template>
  <div aria-label="Attachment actions" role="group" flex gap-1>
    <UiIconButton label="Download" :meaning="UiIconMeaning.Download" @click.stop="downloadUrl(url, filename)" />
    <UiIconButton
      label="Delete"
      :meaning="UiIconMeaning.Delete"
      :variant="UiButtonVariant.Danger"
      @click.stop="emit('delete')"
    />
  </div>
</template>
