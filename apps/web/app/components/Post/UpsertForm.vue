<script setup lang="ts">
import type { Post } from "@esposter/db-schema";
import type { SubmitEventPromise } from "vuetify";

import { POST_TITLE_MAX_LENGTH } from "@esposter/db-schema";

interface Props {
  initialValues?: Pick<Post, "description" | "title">;
  isCreate?: true;
}

const { initialValues = { description: "", title: "" }, isCreate } = defineProps<Props>();
const emit = defineEmits<{
  submit: [event: SubmitEventPromise, values: NonNullable<Props["initialValues"]>];
}>();
const rules = useVRules();
const titleRules = computed(() => [rules.required(), rules.maxLength(POST_TITLE_MAX_LENGTH), rules.isNotProfanity()]);
const values = ref(initialValues);
const isEditFormValid = ref(true);
const submitButtonProps = computed(() => ({
  disabled: !isEditFormValid.value,
  text: isCreate ? "Post" : "Edit Post",
}));
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
              :rules="titleRules"
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
            <StyledButton type="submit" :button-props="submitButtonProps" />
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </StyledCard>
</template>
