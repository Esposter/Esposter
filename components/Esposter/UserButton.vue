<script setup lang="ts">
const { status, data } = $(useSession());
</script>

<template>
  <div v-if="status === 'authenticated' && data?.user?.name" display="flex" items="center">
    <v-avatar v-if="data.user.image">
      <v-img :src="data.user.image" :alt="data.user.name" />
    </v-avatar>
    <DefaultAvatar v-else :name="data.user.name" />
    <div v-if="data.user.name" class="text-subtitle-1">{{ data.user.name }}</div>
  </div>
</template>
