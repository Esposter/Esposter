<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";
import { SITE_NAME } from "@esposter/shared";

const { data: session } = await authClient.useSession(useFetch);
</script>

<template>
  <header v-if="session" flex gap-4 items-center>
    <UiAvatar :image="session.user.image ?? ''" :name="session.user.name" is-large />
    <div flex flex-1 flex-col gap-1 min-w-0>
      <h1 truncate ui-title>{{ session.user.name }}</h1>
      <p truncate>{{ session.user.email }}</p>
      <p text-sm text-muted>
        Joined {{ SITE_NAME }} on
        <NuxtTime :datetime="session.user.createdAt" day="numeric" month="short" year="numeric" />
        (<NuxtTime :datetime="session.user.createdAt" relative />)
      </p>
    </div>
  </header>
</template>
