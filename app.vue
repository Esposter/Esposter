<template>
  <v-app>
    <v-app-bar density="comfortable" app>
      <v-app-bar-title>Esposter</v-app-bar-title>

      <template #append>
        <v-btn icon="mdi-dots-vertical" />
      </template>
    </v-app-bar>

    <NuxtProgressBar />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>
