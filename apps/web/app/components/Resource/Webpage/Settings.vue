<script setup lang="ts">
import { WEBPAGE_DESCRIPTION_MAX_LENGTH } from "#shared/services/resource/constants";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useResourceStore } from "@/store/resource";
import { useWebpageEditorStore } from "@/store/webpageEditor";
import { ResourceType } from "@esposter/db-schema";

const webpageEditorStore = useWebpageEditorStore();
const { loadContent, saveContent } = webpageEditorStore;
const { webpageEditor } = storeToRefs(webpageEditorStore);
const resourceStore = useResourceStore();
const { resource } = storeToRefs(resourceStore);
const uploadFile = useUploadResourceFile(ResourceType.Webpage, () => resource.value?.id ?? "");
const shareImageFiles = ref<File[]>([]);
// A picked image uploads at once and only its url is kept, so the file never waits in the form
watch(shareImageFiles, async (files) => {
  const [file] = files;
  if (!file) return;
  shareImageFiles.value = [];
  webpageEditor.value.imageUrl = await uploadFile(file);
});
// Autosave the share preview as it is edited, the same as the Sheet's Settings blade
watchAutosave(webpageEditor, saveContent);
await loadContent();
</script>

<template>
  <div p-4 gap-4 grid items-start ui-body md:cols-2>
    <UiFrame title="Description">
      <p text-muted>The text under the page's title in a search result and in a shared link.</p>
      <UiTextField
        v-model="webpageEditor.description"
        :counter="WEBPAGE_DESCRIPTION_MAX_LENGTH"
        :maxlength="WEBPAGE_DESCRIPTION_MAX_LENGTH"
        is-label-hidden
        label="Description"
        :rows="3"
      />
    </UiFrame>
    <UiFrame title="Share image">
      <p text-muted>The image above the title and description in a shared link.</p>
      <NuxtImg
        v-if="webpageEditor.imageUrl"
        :src="webpageEditor.imageUrl"
        alt=""
        max-h-48
        max-w-full
        object-contain
        rd="[var(--ui-container-radius)]"
      />
      <FileField
        v-model="shareImageFiles"
        accept="image/*"
        :label="webpageEditor.imageUrl ? 'Replace share image' : 'Share image'"
      />
      <UiButton v-if="webpageEditor.imageUrl" :variant="UiButtonVariant.Quiet" @click="webpageEditor.imageUrl = ''">
        <UiIcon :meaning="UiIconMeaning.Remove" />
        Remove
      </UiButton>
    </UiFrame>
    <p text-sm text-muted flex gap-2 items-center md:col-span-2>
      <UiIcon :meaning="UiIconMeaning.Info" />
      Changes save as you make them, and show in a shared link once the page is published again.
    </p>
  </div>
</template>
