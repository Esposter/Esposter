<template>
  <NuxtPwaAssets />
  <NuxtTheme>
    <NuxtSEO>
      <v-app>
        <EsposterAppBar />
        <EsposterLoadingIndicator />
        <NuxtPage />
        <StyledAlertList />
      </v-app>
    </NuxtSEO>
  </NuxtTheme>
</template>

<style lang="scss">
// Only show scrollbar when content actually exceeds screen height
html {
  overflow-y: auto;
}

// Maintain height for line breaks as tiptap editor inserts empty <p> tag for newlines
p:empty::before {
  content: "";
  display: inline-block;
}

// Canvas by default is an inline element and can cause vertical scrollbar to appear
// https://stackoverflow.com/questions/37765215/canvas-dimensions-cause-a-vertical-scroll-bar-to-appear
canvas {
  display: block;
}
</style>
