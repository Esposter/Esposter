<template>
  <v-app>
    <v-app-bar density="comfortable" app>
      <v-app-bar-title>Esposter</v-app-bar-title>

      <template #append>
        <ChangeThemeButton />
        <v-btn icon="mdi-dots-vertical" />
      </template>
    </v-app-bar>

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </v-app>
</template>

<style lang="scss">
$background: #00dc80;

#nprogress {
  pointer-events: none;
}

#nprogress .bar {
  position: fixed;
  top: 56px;
  left: 0;
  width: 100%;
  height: 3px;
  background: $background;
  z-index: 9999;
}

/* Fancy blur effect */
#nprogress .peg {
  width: 100%;
  height: 100%;
  box-shadow: 0 0 5px $background;
}
</style>
