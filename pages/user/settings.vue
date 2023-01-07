<script setup lang="ts">
import { useDisplay } from "vuetify";

const { mobile } = $(useDisplay());
</script>

<template>
  <NuxtLayout>
    <v-container>
      <v-row>
        <v-col cols="8">
          <UserProfileCard />
        </v-col>
      </v-row>
      <v-row> </v-row>
    </v-container>
  </NuxtLayout>
</template>
