<template>
  <v-app>
    <EsposterAppBar />
    <NuxtTheme>
      <NuxtSEO>
        <NuxtPage />
      </NuxtSEO>
    </NuxtTheme>
  </v-app>
</template>

<style lang="scss">
html {
  overflow-y: auto;
}

#nprogress {
  pointer-events: none;
}

#nprogress .bar {
  position: fixed;
  top: 56px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: $vueBackgroundColor;
  // Put progress bar just above appbar which has z index of 1000
  // but below menus which have z index of 2000
  z-index: 1500;
}

// Fancy blur effect
#nprogress .peg {
  width: 100%;
  height: 100%;
  box-shadow: 0 0 5px $vueBackgroundColor;
}
</style>
