<script setup lang="ts">
import type { UploadFileUrl } from "@/models/message/file/UploadFileUrl";
import type { FileEntity } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  file: FileEntity;
  index: number;
  uploadFileUrl?: UploadFileUrl;
}

const { file, index, uploadFileUrl = { progress: 1, url: "" } } = defineProps<Props>();
const emit = defineEmits<{ delete: [number]; toggleSpoiler: [string] }>();
const progressPercentage = computed(() => uploadFileUrl.progress * 100);
</script>

<!-- An attachment waiting in the composer, as Discord shows one: its preview, its name, how much of it has uploaded
     while it is still on its way, and the button that takes it back out -->
<template>
  <div p-2 flex shrink-0 flex-col gap-2 w-48 relative ui-field>
    <div h-28 relative of-hidden>
      <MessageModelFileRenderer :class="{ 'blur-sm': file.isSpoiler }" :file :url="uploadFileUrl.url" is-preview />
      <div
        v-if="file.isSpoiler"
        class="text-white text-center bg-black/60 flex pointer-events-none items-center inset-0 justify-center absolute backdrop-blur-sm"
      >
        SPOILER
      </div>
    </div>
    <UiLoadingBar
      v-if="progressPercentage < 100"
      :label="`Uploading ${file.filename}`"
      :value="Math.ceil(progressPercentage)"
    />
    <span text-sm truncate>{{ file.filename }}</span>
    <UiIconButton
      :label="file.isSpoiler ? 'Remove Spoiler Mark' : 'Mark Attachment as Spoiler'"
      :meaning="file.isSpoiler ? UiIconMeaning.Show : UiIconMeaning.Hide"
      right-10
      top-1
      absolute
      @click="emit('toggleSpoiler', file.id)"
    />
    <UiIconButton
      label="Delete Attachment"
      :meaning="UiIconMeaning.Delete"
      right-1
      top-1
      absolute
      @click="emit('delete', index)"
    />
  </div>
</template>
