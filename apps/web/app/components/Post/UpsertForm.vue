<script setup lang="ts">
import type { Post } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { POST_TITLE_MAX_LENGTH } from "@esposter/db-schema";

interface Props {
  initialValues?: Pick<Post, "description" | "title">;
  isCreate?: true;
}

const { initialValues = { description: "", title: "" }, isCreate } = defineProps<Props>();
const emit = defineEmits<{ submit: [values: NonNullable<Props["initialValues"]>] }>();
const rules = useVRules();
const titleRules = computed(() => [rules.required(), rules.maxLength(POST_TITLE_MAX_LENGTH), rules.isNotProfanity()]);
const values = ref(initialValues);
const isValid = ref(true);
</script>

<template>
  <!-- Reddit's composer on the page itself: the heading with the one action it leads to beside it, then the title and the
    Body as the two fields they are, each saying what it takes inside itself -->
  <UiForm v-model:is-valid="isValid" flex flex-col gap-4 @submit="emit('submit', values)">
    <div flex gap-2 items-center>
      <h1 flex-1 truncate ui-title>{{ isCreate ? "Create post" : "Edit post" }}</h1>
      <UiButton type="submit" :disabled="!isValid" :variant="UiButtonVariant.Accent">
        {{ isCreate ? "Post" : "Save" }}
      </UiButton>
    </div>
    <UiTextField
      v-model="values.title"
      label="Title"
      :counter="POST_TITLE_MAX_LENGTH"
      :rules="titleRules"
      is-autofocus
      is-label-hidden
      placeholder="Title"
    />
    <PostDescriptionRichTextEditor v-model="values.description" />
  </UiForm>
</template>
