<script setup lang="ts">
import { UiDialogPlacement } from "#src/models/ui/UiDialogPlacement";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { getMimeCategory, MimeCategory } from "@esposter/db-schema";
import { downloadUrl } from "@esposter/shared";

const { file, index, isOpen, isZoomed, url, view, viewableFiles, zoom } = useFileViewer();
const isExpanded = ref(false);
// Over the whole page the picture takes the room the page gives it, past the title bar and the footer, as it does in
// The middle of the screen
const mediaHeightClass = computed(() => (isExpanded.value ? "max-h-[88dvh]" : "max-h-[64dvh]"));
</script>

<template>
  <!-- A picture looked at on its own, in the middle of the screen, with the way through the rest of the message's set
    Under it. Its buttons sit by the picture, so they take the raised default rather than the quiet look -->
  <UiDialog
    v-if="file"
    v-model="isOpen"
    v-model:is-expanded="isExpanded"
    max-w="[90vw]"
    :placement="UiDialogPlacement.Middle"
    :title="file.filename"
  >
    <div
      :class="isZoomed ? 'cursor-grab' : 'cursor-zoom-in'"
      flex
      flex-1
      items-center
      justify-center
      of-hidden
      @wheel="(event) => zoom(event)"
    >
      <video
        v-if="getMimeCategory(file.mimetype) === MimeCategory.Video"
        :class="mediaHeightClass"
        controls
        autoplay
        max-w-full
        cursor-default
        :src="url"
      />
      <div v-else ref="image">
        <NuxtImg :class="mediaHeightClass" max-w-full :src="url" :alt="file.filename" />
      </div>
    </div>
    <template #footer>
      <span text-sm text-muted flex-1>{{ index + 1 }} of {{ viewableFiles.length }}</span>
      <UiIconButton label="Previous" :meaning="UiIconMeaning.Previous" :disabled="index === 0" @click="view(-1)" />
      <UiIconButton
        label="Next"
        :meaning="UiIconMeaning.Next"
        :disabled="index === viewableFiles.length - 1"
        @click="view(1)"
      />
      <UiIconButton label="Download" :meaning="UiIconMeaning.Download" @click="downloadUrl(url, file.filename)" />
    </template>
  </UiDialog>
</template>
