<script setup lang="ts">
interface Item {
  title: string;
  href: string;
  icon: string;
}

const items: Item[] = [
  {
    title: "Esbabbler",
    href: MESSAGES_INDEX_PATH,
    icon: "mdi-message-fast",
  },
];
</script>

<template>
  <v-list>
    <InvisibleNuxtLink v-for="item in items" :key="item.title" :to="item.href">
      <v-list-item :value="item.title">
        <template #prepend>
          <v-avatar color="background">
            <v-icon :icon="item.icon" />
          </v-avatar>
        </template>
        <v-list-item-title font="bold!">{{ item.title }}</v-list-item-title>
      </v-list-item>
    </InvisibleNuxtLink>
  </v-list>
</template>
