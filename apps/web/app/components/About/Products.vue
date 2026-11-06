<script setup lang="ts">
import { ProductGroups } from "@/services/app/ProductGroups";
</script>

<!-- What there is to do here, in the launcher's own groups and words, each place one plain line on what it is for. The
     groups stand side by side as columns and wrap when the screen narrows, so a wide screen is used across -->
<template>
  <nav
    aria-label="Places"
    gap-4
    grid
    items-start
    justify-center
    w-full
    :style="{ gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 20rem))' }"
  >
    <section v-for="{ items, title } of ProductGroups" :key="title" flex flex-col gap-2>
      <h2 ui-title>{{ title }}</h2>
      <ul list-none flex flex-col gap-2>
        <li v-for="item of items" :key="item.title">
          <NuxtInvisibleLink :to="item.href" ui-card flex flex-col gap-1>
            <h3 flex gap-2 min-w-0 items-center ui-heading>
              <span :class="item.icon" aria-hidden="true" text-accent shrink-0 size-8 />
              <span truncate>{{ item.title }}</span>
            </h3>
            <span text-muted ui-lede>{{ item.description }}</span>
          </NuxtInvisibleLink>
        </li>
      </ul>
    </section>
  </nav>
</template>
