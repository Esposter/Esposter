<template>
  <v-app>
    <v-app-bar class="w-100" density="comfortable">
      <v-app-bar-title>Esposter</v-app-bar-title>

      <template #append>
        <v-btn icon="mdi-dots-vertical" />
      </template>
    </v-app-bar>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>
