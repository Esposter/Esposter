<script setup lang="ts">
import { ProductGroups } from "@/services/app/ProductGroups";

const emit = defineEmits<{ select: [] }>();
</script>

<template>
  <nav aria-label="Products" flex flex-col gap-3>
    <section v-for="{ items, title } of ProductGroups" :key="title" flex flex-col>
      <h2 text-sm text-muted px-2>{{ title }}</h2>
      <NuxtInvisibleLink
        v-for="item of items"
        :key="item.title"
        :to="item.href"
        py-1
        ui-item
        flex
        gap-2
        items-center
        @click="emit('select')"
      >
        <span :class="item.icon" aria-hidden="true" size-6 inline-block />
        {{ item.title }}
      </NuxtInvisibleLink>
    </section>
  </nav>
</template>
