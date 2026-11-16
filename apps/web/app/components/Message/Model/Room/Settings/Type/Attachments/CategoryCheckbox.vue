<script setup lang="ts">
import type { MimeCategory } from "@esposter/db-schema";

import { MimeCategories } from "@esposter/db-schema";

interface Props {
  category: MimeCategory;
}

const allowedMimeCategories = defineModel<MimeCategory[]>({ required: true });
const { category } = defineProps<Props>();
const emit = defineEmits<{ save: [] }>();
</script>

<template>
  <UiCheckbox
    is-label-shown
    :label="category"
    :model-value="allowedMimeCategories.includes(category)"
    @update:model-value="
      (isAllowed) => {
        allowedMimeCategories = isAllowed
          ? MimeCategories.filter(
              (mimeCategory) => mimeCategory === category || allowedMimeCategories.includes(mimeCategory),
            )
          : allowedMimeCategories.filter((mimeCategory) => mimeCategory !== category);
        emit('save');
      }
    "
  />
</template>
