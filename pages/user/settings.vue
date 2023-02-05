<script setup lang="ts">
definePageMeta({ middleware: "auth" });
</script>

<template>
  <NuxtLayout>
    <v-container>
      <v-row>
        <v-col>
          <UserProfileCard />
        </v-col>
      </v-row>
    </v-container>
  </NuxtLayout>
</template>
