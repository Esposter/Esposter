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
  <UiForm v-model:is-valid="isValid" @submit="emit('submit', values)">
    <UiFrame>
      <h1 ui-title>{{ isCreate ? "Create post" : "Edit post" }}</h1>
      <UiTextField
        v-model="values.title"
        label="Title"
        :counter="POST_TITLE_MAX_LENGTH"
        :rules="titleRules"
        is-autofocus
      />
      <PostDescriptionRichTextEditor v-model="values.description" />
      <div flex justify-end>
        <UiButton type="submit" :disabled="!isValid" :variant="UiButtonVariant.Accent">
          {{ isCreate ? "Post" : "Save" }}
        </UiButton>
      </div>
    </UiFrame>
  </UiForm>
</template>
