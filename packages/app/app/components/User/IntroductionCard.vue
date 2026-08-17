<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { SITE_NAME } from "@esposter/shared";

const { data: session } = await authClient.useSession(useFetch);
</script>

<template>
  <StyledCard v-if="session" p-6 flex>
    <div flex-1 grid>
      <div font-bold text-headline-small>{{ session.user.name }}</div>
      <div>
        {{ session.user.email }}
      </div>
      <div>
        Joined {{ SITE_NAME }} on
        <NuxtTime :datetime="session.user.createdAt" day="numeric" month="short" year="numeric" />
        (<NuxtTime :datetime="session.user.createdAt" relative />)
      </div>
    </div>
    <StyledAvatar :image="session.user.image" :name="session.user.name" :avatar-props="{ size: '6rem' }" />
  </StyledCard>
</template>
