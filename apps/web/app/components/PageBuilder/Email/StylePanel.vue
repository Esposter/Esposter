<script setup lang="ts">
import { UiCollapsibleVariant } from "#src/models/ui/UiCollapsibleVariant";
import { MimeCategory, ResourceType } from "@esposter/db-schema";

interface Props {
  resourceId: string;
}
// An email node has no breakpoint or state to choose, so its style is its attribute fields alone, grouped in the webpage's sectors
const { resourceId } = defineProps<Props>();
const { hasNode, sections, setField } = useEmailStyle(() => resourceId);
// Every sector starts open, and a reader's collapses are kept for the session
const collapsedSections = ref(new Set<string>());
const setSectionOpen = (title: string, isOpen: boolean) => {
  if (isOpen) collapsedSections.value.delete(title);
  else collapsedSections.value.add(title);
};
</script>

<template>
  <div v-if="hasNode" flex flex-col gap-4>
    <UiCollapsible
      v-for="section of sections"
      :key="section.title"
      :model-value="!collapsedSections.has(section.title)"
      :variant="UiCollapsibleVariant.Header"
      @update:model-value="(isOpen) => setSectionOpen(section.title, isOpen)"
    >
      <template #title>{{ section.title }}</template>
      <div flex flex-col gap-3>
        <PageBuilderEmailStyleField
          v-for="field of section.fields"
          :key="field.name"
          :field
          @reset="setField(field.name, '')"
          @update="(value) => setField(field.name, value)"
        />
        <PageBuilderEmailImageUploadField
          v-if="section.fields.some((field) => field.name === 'src')"
          :resource-id
          @update="(src: string, nodeId: string) => setField('src', src, nodeId)"
        />
        <PageBuilderFilePicker
          v-if="section.fields.some((field) => field.name === 'src')"
          :category="MimeCategory.Image"
          :resource-id
          :type="ResourceType.Email"
          @update="(src) => setField('src', src)"
        />
      </div>
    </UiCollapsible>
  </div>
  <p v-else text-muted>Select a block to style it</p>
</template>
