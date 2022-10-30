<script setup lang="ts">
import { Post } from "@prisma/client";
import { POST_MAX_TITLE_LENGTH } from "@/util/constants.common";
import { formRules } from "@/util/formRules";

interface EditCreateCardProps {
  initialValues?: Partial<Post>;
}

const props = defineProps<EditCreateCardProps>();
const { initialValues } = toRefs(props);
const title = ref(initialValues?.value?.title ?? "");
const description = ref(initialValues?.value?.description ?? "");
</script>

<template>
  <v-card>
    <v-form
      @submit="
        (e) => {
          e.preventDefault();
        }
      "
    >
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
            <StyledButton color="primary" type="submit">Post</StyledButton>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-card>
</template>
