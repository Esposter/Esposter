<script setup lang="ts">
import { type Post } from "@/db/schema/posts";
import { POST_TITLE_MAX_LENGTH } from "@/services/post/constants";
import { formRules } from "@/services/vuetify/formRules";
import { type SubmitEventPromise } from "vuetify";

export interface PostUpsertFormProps {
  initialValues?: Pick<Post, "title" | "description">;
}

const { initialValues = { title: "", description: "" } } = defineProps<PostUpsertFormProps>();
const emit = defineEmits<{
  submit: [submitEventPromise: SubmitEventPromise, values: NonNullable<PostUpsertFormProps["initialValues"]>];
}>();
const title = ref(initialValues.title);
const description = ref(initialValues.description);
const isValid = ref(true);
</script>

<template>
  <StyledCard>
    <v-form
      v-model="isValid"
      @submit="
        (e) => {
          e.preventDefault();
          emit('submit', e, { title, description });
        }
      "
    >
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
            <PostDescriptionRichTextEditor v-model="description" />
          </v-col>
        </v-row>
        <v-row>
          <v-col flex justify-end>
            <StyledButton type="submit" :disabled="!isValid">Post</StyledButton>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </StyledCard>
</template>
