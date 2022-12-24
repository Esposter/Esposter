<script setup lang="ts">
const { status, data } = $(useSession());
</script>

<template>
  <div v-if="status === 'authenticated' && data?.user?.name" display="flex" items="center">
    <v-avatar v-if="data.user.image">
      <v-img :src="data.user.image" :alt="data.user.name" />
    </v-avatar>
    <DefaultAvatar v-else :name="data.user.name" />
    <div class="text-subtitle-1" pl="1">{{ data.user.name }}</div>
  </div>
</template>
