<script setup lang="ts">
import { SITE_NAME } from "@/services/esposter/constants";
import dayjs from "dayjs";

const { $client } = useNuxtApp();
const user = await $client.user.readUser.query();
</script>

<template>
  <StyledCard v-if="user" p-6="!" flex="!">
    <div grid flex-1>
      <div v-if="user.name" class="text-h5" font-bold>{{ user.name }}</div>
      <div>
        {{ user.email }}
      </div>
      <div>
        Joined {{ SITE_NAME }} on {{ dayjs(user.createdAt).format("MMM D, YYYY") }} ({{
          dayjs(user.createdAt).fromNow()
        }})
      </div>
    </div>
    <v-avatar v-if="user.image" size="6rem">
      <v-img :src="user.image" :alt="user.name ?? ''" />
    </v-avatar>
  </StyledCard>
</template>
