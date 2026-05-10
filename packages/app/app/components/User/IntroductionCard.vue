<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { SITE_NAME } from "@esposter/shared";

const { data: session } = await authClient.useSession(useFetch);
const createdAt = useDateFormat(() => session.value?.user.createdAt, "MMM D, YYYY");
const createdAtTimeAgo = useTimeAgo(() => session.value?.user.createdAt ?? "");
</script>

<template>
  <StyledCard v-if="session" flex p-6>
    <div grid flex-1>
      <div text-headline-small font-bold>{{ session.user.name }}</div>
      <div>
        {{ session.user.email }}
      </div>
      <div>Joined {{ SITE_NAME }} on {{ createdAt }} ({{ createdAtTimeAgo }})</div>
    </div>
    <StyledAvatar :image="session.user.image" :name="session.user.name" :avatar-props="{ size: '6rem' }" />
  </StyledCard>
</template>
