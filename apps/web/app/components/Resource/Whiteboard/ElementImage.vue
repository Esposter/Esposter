<script setup lang="ts">
import type { ImageElement } from "headless-block-editor";

import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { useResourceStore } from "@/store/resource";
import { getResourceFileBlobName } from "@esposter/db-schema";

interface Props {
  image: ImageElement;
}

const { image } = defineProps<Props>();
const resourceStore = useResourceStore();
const { currentResourceId } = storeToRefs(resourceStore);
const href = computed(() => getResourceAssetUrl(getResourceFileBlobName(currentResourceId.value, image.fileId)));
</script>

<template>
  <image
    :x="image.x"
    :y="image.y"
    :width="image.width"
    :height="image.height"
    :href
    preserveAspectRatio="xMidYMid meet"
  />
</template>
