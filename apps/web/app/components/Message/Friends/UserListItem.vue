<script setup lang="ts">
import type { User } from "better-auth";

interface Props {
  image?: User["image"];
  name: User["name"];
}

defineSlots<{ append?: () => VNode }>();
const { image, name } = defineProps<Props>();
</script>

<template>
  <li ui-row>
    <UiItemContent :image="image ?? ''" :title="name" />
    <slot name="append" />
  </li>
</template>
