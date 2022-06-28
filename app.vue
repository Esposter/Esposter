<template>
  <v-app>
    <v-app-bar class="w-100" density="comfortable">
      <v-app-bar-title>Esposter</v-app-bar-title>

      <template #append>
        <v-btn icon="mdi-dots-vertical" />
      </template>
    </v-app-bar>

    <v-main class="top-56">
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </v-main>
  </v-app>
</template>

<style lang="scss" scoped>
.top-56 {
  top: 56px;
}
</style>
