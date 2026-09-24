<script setup lang="ts">
interface Props {
  description: string;
  permission: bigint;
  title: string;
}

const { description, permission, title } = defineProps<Props>();
const modelValue = defineModel<bigint>({ required: true });
const descriptionId = useId();
</script>

<!-- A setting rather than a row of a list: the name, the sentence saying what it allows in full, since it is the only
     thing on the row a reader does not already know from the name, and the switch at the end -->
<template>
  <div py-2 flex gap-4 items-center>
    <div flex flex-1 flex-col min-w-0>
      <span>{{ title }}</span>
      <span :id="descriptionId" text-sm text-muted>{{ description }}</span>
    </div>
    <UiSwitch
      :aria-describedby="descriptionId"
      :label="title"
      :model-value="Boolean(modelValue & permission)"
      @update:model-value="modelValue = modelValue ^ permission"
    />
  </div>
</template>
