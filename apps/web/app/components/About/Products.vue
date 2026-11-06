<script setup lang="ts">
import { ProductGroups } from "@/services/app/ProductGroups";
</script>

<!-- What there is to do here, in the launcher's own groups and words, each card one plain line on what it is for -->
<template>
  <section flex flex-col gap-6 w-full>
    <div v-for="{ items, title } of ProductGroups" :key="title" flex flex-col gap-3>
      <h2 ui-heading>{{ title }}</h2>
      <div gap-3 grid :style="{ gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))' }">
        <NuxtInvisibleLink v-for="item of items" :key="item.title" :to="item.href" ui-card flex flex-col gap-2 h-full>
          <span flex gap-2 min-w-0 items-center>
            <span :class="item.icon" aria-hidden="true" text-accent shrink-0 size-6 />
            <span truncate ui-heading>{{ item.title }}</span>
          </span>
          <span text-muted>{{ item.description }}</span>
        </NuxtInvisibleLink>
      </div>
    </div>
  </section>
</template>
