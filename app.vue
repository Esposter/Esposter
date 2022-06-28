<template>
  <v-app>
    <v-app-bar density="comfortable">
      <v-app-bar-title>Esposter</v-app-bar-title>

      <template #append>
        <v-btn icon="mdi-dots-vertical" />
      </template>
    </v-app-bar>

    <v-main>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </v-main>
  </v-app>
</template>
