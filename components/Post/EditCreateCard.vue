<script setup lang="ts">
import { Post } from "@prisma/client";

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
    <v-container>
      <v-row>
        <v-col>
          <v-text-field
            placeholder="Title"
            autofocus
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
    </v-container>
  </v-card>
</template>
