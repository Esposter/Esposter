<script setup lang="ts">
import type { Post } from "@/server/db/schema/posts";
import type { SubmitEventPromise } from "vuetify";

import { formRules } from "@/services/vuetify/formRules";
import { POST_TITLE_MAX_LENGTH } from "@/shared/services/post/constants";

export interface PostUpsertFormProps {
  initialValues?: Pick<Post, "description" | "title">;
}

const { initialValues = { description: "", title: "" } } = defineProps<PostUpsertFormProps>();
const emit = defineEmits<{
  submit: [event: SubmitEventPromise, values: NonNullable<PostUpsertFormProps["initialValues"]>];
}>();
const title = ref(initialValues.title);
const description = ref(initialValues.description);
const isValid = ref(true);
</script>

<template>
  <StyledCard>
    <v-form v-model="isValid" @submit.prevent="emit('submit', $event, { title, description })">
      <v-container>
        <v-row>
          <v-col>
            <v-text-field
              v-model="title"
              label="Title"
              placeholder="Title"
              autofocus
              :counter="POST_TITLE_MAX_LENGTH"
              :rules="[
                formRules.required,
                formRules.requireAtMostNCharacters(POST_TITLE_MAX_LENGTH),
                formRules.isNotProfanity,
              ]"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <PostDescriptionRichTextEditor v-model="description" />
          </v-col>
        </v-row>
        <v-row>
          <v-col flex justify-end>
            <StyledButton
              type="submit"
              :button-props="{
                disabled: !isValid,
              }"
            >
              Post
            </StyledButton>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </StyledCard>
</template>
