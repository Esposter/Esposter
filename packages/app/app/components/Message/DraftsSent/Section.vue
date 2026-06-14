<script setup lang="ts">
interface MessageDraftsSentSectionProps {
  title: string;
}

const { title } = defineProps<MessageDraftsSentSectionProps>();
</script>

<template>
  <section>
    <div font-bold mb-3>{{ title }}</div>
    <v-list b-1 b-border rd-lg b-solid>
      <slot />
    </v-list>
  </section>
</template>
