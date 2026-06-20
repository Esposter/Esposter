<script setup lang="ts">
import { authClient } from "@/services/auth/authClient";

const { data: session } = await authClient.useSession(useFetch);
</script>

<template>
  <v-container v-if="session" fluid>
    <div font-bold mb-4 text-title-medium>My Account</div>
    <StyledCard p-4>
      <div text-gray text-body-small>Username</div>
      <div mb-4 text-body-large>{{ session.user.name }}</div>
      <div text-gray text-body-small>Email</div>
      <div text-body-large>{{ session.user.email }}</div>
    </StyledCard>
  </v-container>
</template>
