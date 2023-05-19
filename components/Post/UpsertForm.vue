<script setup lang="ts">
import { formRules } from "@/services/vuetify/formRules";
import type { Post } from "@prisma/client";
import type { SubmitEventPromise } from "vuetify";

export interface PostUpsertFormProps {
  initialValues?: Pick<Post, "title" | "description">;
}

const props = withDefaults(defineProps<PostUpsertFormProps>(), {
  initialValues: () => ({ title: "", description: "" }),
});
const { initialValues } = toRefs(props);
const emit = defineEmits<{
  submit: [submitEventPromise: SubmitEventPromise, values: NonNullable<PostUpsertFormProps["initialValues"]>];
}>();
const title = ref(initialValues.value.title);
const description = ref(initialValues.value.description);
</script>

<template>
  <v-card>
    <v-form @submit="(e) => emit('submit', e, { title, description })">
      <v-container>
        <v-row>
          <v-col>
            <v-text-field
              v-model="title"
              label="Title"
              placeholder="Title"
              autofocus
              :counter="POST_TITLE_MAX_LENGTH"
              :rules="[formRules.required, formRules.requireAtMostNCharacters(POST_TITLE_MAX_LENGTH)]"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <RichTextEditor
              v-model="description"
              placeholder="Text (optional)"
              :max-length="POST_DESCRIPTION_MAX_LENGTH"
            >
              <template #prepend-footer="{ editor }">
                <RichTextEditorCustomEmojiPickerButton :editor="editor" tooltip="Choose an emoji" />
              </template>
            </RichTextEditor>
          </v-col>
        </v-row>
        <v-row>
          <v-col display="flex" justify="end">
            <StyledButton type="submit">Post</StyledButton>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-card>
</template>
