<script setup lang="ts">
import { usePostStore } from "@/store/usePostStore";
import { INDEX_PATH } from "@/util/constants.client";
import { POST_MAX_TITLE_LENGTH } from "@/util/constants.common";
import { formRules } from "@/util/formRules";
import { Post } from "@prisma/client";
import { SubmitEventPromise } from "vuetify";

interface UpsertCardProps {
  initialValues?: Pick<Post, "title" | "description">;
}

const props = withDefaults(defineProps<UpsertCardProps>(), {
  initialValues: () => ({ title: "", description: "" }),
});
const { initialValues } = $(toRefs(props));
const { $client } = useNuxtApp();
const { createPost } = usePostStore();
const title = $ref(initialValues.title);
const description = $ref(initialValues.description);
const onCreatePost = async (e: SubmitEventPromise) => {
  e.preventDefault();
  const newPost = await $client.post.createPost.mutate({ title, description });
  createPost(newPost);
  await navigateTo(INDEX_PATH);
};
</script>

<template>
  <v-card>
    <v-form @submit="onCreatePost">
      <v-container>
        <v-row>
          <v-col>
            <v-text-field
              variant="outlined"
              placeholder="Title"
              autofocus
              :counter="POST_MAX_TITLE_LENGTH"
              :rules="[formRules.required, formRules.requireAtMostNCharacters(POST_MAX_TITLE_LENGTH)]"
              :model-value="title"
              @update:model-value="(value) => (title = value)"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <RichTextEditor :content="description" />
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
