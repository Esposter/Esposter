<script setup lang="ts">
import type { Post } from "@esposter/db-schema";
import type { SubmitEventPromise } from "vuetify";

import { formRules } from "@/services/vuetify/formRules";
import { POST_TITLE_MAX_LENGTH } from "@esposter/db-schema";

interface PostUpsertFormProps {
  initialValues?: Pick<Post, "description" | "title">;
  isCreate?: boolean;
}

const { initialValues = { description: "", title: "" }, isCreate = false } = defineProps<PostUpsertFormProps>();
const emit = defineEmits<{
  submit: [event: SubmitEventPromise, values: NonNullable<PostUpsertFormProps["initialValues"]>];
}>();
const values = ref(initialValues);
const isEditFormValid = ref(true);
</script>

<template>
  <StyledCard>
    <v-form v-model="isEditFormValid" @submit.prevent="emit('submit', $event, values)">
      <v-container>
        <v-row>
          <v-col>
            <v-text-field
              v-model="values.title"
              label="Title"
              placeholder="Title"
              :counter="POST_TITLE_MAX_LENGTH"
              :rules="[
                formRules.required,
                formRules.requireAtMostNCharacters(POST_TITLE_MAX_LENGTH),
                formRules.isNotProfanity,
              ]"
              autofocus
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <PostDescriptionRichTextEditor v-model="values.description" />
          </v-col>
        </v-row>
        <v-row>
          <v-col flex justify-end>
            <StyledButton
              type="submit"
              :button-props="{ disabled: !isEditFormValid, text: isCreate ? 'Post' : 'Edit Post' }"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </StyledCard>
</template>
