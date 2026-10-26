<script setup lang="ts">
interface Props {
  resourceId: string;
}
// An email node has no breakpoint or state to choose, so its style is its attribute fields alone
const { resourceId } = defineProps<Props>();
const { fields, hasNode, setField } = useEmailStyle(() => resourceId);
</script>

<template>
  <div v-if="hasNode" flex flex-col gap-3>
    <PageBuilderEmailStyleField
      v-for="field of fields"
      :key="field.name"
      :field
      @reset="setField(field.name, '')"
      @update="(value) => setField(field.name, value)"
    />
    <PageBuilderEmailImageUploadField
      v-if="fields.some((field) => field.name === 'src')"
      :resource-id
      @update="(src: string) => setField('src', src)"
    />
  </div>
  <p v-else text-muted>Select a block to style it</p>
</template>
