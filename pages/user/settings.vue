<script setup lang="ts">
import { useDisplay } from "vuetify";

definePageMeta({ middleware: "auth" });

const { mobile } = $(useDisplay());
</script>

<template>
  <NuxtLayout>
    <v-container>
      <v-row>
        <v-col :cols="mobile ? 12 : 8">
          <UserProfileCard />
        </v-col>
      </v-row>
    </v-container>
  </NuxtLayout>
</template>
