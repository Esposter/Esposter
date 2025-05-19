<script setup lang="ts">
import { SITE_NAME } from "#shared/services/esposter/constants";
import { authClient } from "@/services/auth/authClient";

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
    <StyledAvatar :image="session.user.image ?? null" :name="session.user.name" :avatar-props="{ size: '6rem' }" />
  </StyledCard>
</template>
