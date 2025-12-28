<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { SITE_NAME } from "@esposter/shared";

const { data: session } = await authClient.useSession(useFetch);
const createdAt = useDateFormat(() => session.value?.user.createdAt, "MMM D, YYYY");
const createdAtTimeAgo = useTimeAgo(() => session.value?.user.createdAt ?? "");
</script>

<template>
  <StyledCard v-if="session" p-6 flex="!">
    <div flex-1 grid>
      <div class="text-h5" font-bold>{{ session.user.name }}</div>
      <div>
        {{ session.user.email }}
      </div>
      <div>Joined {{ SITE_NAME }} on {{ createdAt }} ({{ createdAtTimeAgo }})</div>
    </div>
    <StyledAvatar :image="session.user.image" :name="session.user.name" :avatar-props="{ size: '6rem' }" />
  </StyledCard>
</template>
