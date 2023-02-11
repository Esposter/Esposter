<script setup lang="ts">
import type { Post } from "@prisma/client";
import type { SubmitEventPromise } from "vuetify";

export interface PostUpsertFormProps {
  initialValues?: Pick<Post, "title" | "description">;
}

const props = withDefaults(defineProps<PostUpsertFormProps>(), {
  initialValues: () => ({ title: "", description: "" }),
});
const { initialValues } = $(toRefs(props));
const emit = defineEmits<{
  (
    event: "submit",
    submitEventPromise: SubmitEventPromise,
    values: NonNullable<PostUpsertFormProps["initialValues"]>
  ): void;
}>();
const title = $ref(initialValues.title);
const description = $ref(initialValues.description);
</script>

<template>
  <v-card>
    <v-form @submit="(e) => emit('submit', e, { title, description })">
      <v-container>
        <v-row>
          <v-col>
            <v-text-field
              variant="outlined"
              label="Title"
              placeholder="Title"
              autofocus
              :counter="POST_TITLE_MAX_LENGTH"
              :rules="[formRules.required, formRules.requireAtMostNCharacters(POST_TITLE_MAX_LENGTH)]"
              :model-value="title"
              @update:model-value="(value) => (title = value)"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <RichTextEditor :content="description" @update:content="(value) => (description = value)" />
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
