<script setup lang="ts">
import dayjs from "dayjs";

const { $client } = useNuxtApp();
const user = await $client.user.readUser.query();
</script>

<template>
  <StyledCard v-if="user" p="6!" display="flex!">
    <div flex="1" display="grid">
      <div v-if="user.name" class="text-h5" font="bold">{{ user.name }}</div>
      <div>
        {{ user.email }}
      </div>
      <div>
        Joined {{ SITE_NAME }} on {{ dayjs(user.createdAt).format("MMM d, YYYY") }} ({{
          dayjs(user.createdAt).fromNow()
        }})
      </div>
    </div>
    <v-avatar v-if="user.image" size="6rem">
      <v-img :src="user.image" :alt="user.name ?? ''" />
    </v-avatar>
  </StyledCard>
</template>
