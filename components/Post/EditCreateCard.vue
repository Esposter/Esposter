<script setup lang="ts">
import { testUser } from "@/assets/data/test";
import { usePostStore } from "@/store/usePostStore";
import { POST_MAX_TITLE_LENGTH } from "@/util/constants.common";
import { formRules } from "@/util/formRules";
import { Post } from "@prisma/client";
import { SubmitEventPromise } from "vuetify";

interface EditCreateCardProps {
  initialValues?: Pick<Post, "title" | "description">;
}

const props = withDefaults(defineProps<EditCreateCardProps>(), {
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
  createPost({ ...newPost, creator: testUser });
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
