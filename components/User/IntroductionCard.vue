<script setup lang="ts">
import { SITE_NAME } from "@/services/esposter/constants";
import { useUserStore } from "@/store/user";
import dayjs from "dayjs";

const userStore = useUserStore();
const { authUser } = storeToRefs(userStore);
</script>

<template>
  <StyledCard v-if="authUser" p-6="!" flex="!">
    <div grid flex-1>
      <div v-if="authUser.name" class="text-h5" font-bold>{{ authUser.name }}</div>
      <div>
        {{ authUser.email }}
      </div>
      <div>
        Joined {{ SITE_NAME }} on {{ dayjs(authUser.createdAt).format("MMM D, YYYY") }} ({{
          dayjs(authUser.createdAt).fromNow()
        }})
      </div>
    </div>
    <v-avatar v-if="authUser.image" size="6rem">
      <v-img :src="authUser.image" :alt="authUser.name ?? ''" />
    </v-avatar>
  </StyledCard>
</template>
