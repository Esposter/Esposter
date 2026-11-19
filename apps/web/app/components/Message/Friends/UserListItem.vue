<script setup lang="ts">
import type { PublicUser } from "@esposter/db-schema";

interface Props {
  image?: PublicUser["image"] | undefined;
  name: PublicUser["name"];
}

defineSlots<{ append?: () => VNode }>();
defineProps<Props>();
</script>

<template>
  <li ui-row>
    <UiItemContent :image="image ?? ''" :title="name" />
    <slot name="append" />
  </li>
</template>
