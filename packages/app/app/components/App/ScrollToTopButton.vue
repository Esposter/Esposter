<script setup lang="ts">
const SHOW_SCROLL_TO_TOP_OFFSET = 200;
const { y } = useWindowScroll();
const goTo = useVGoTo();
</script>

<template>
  <v-fade-transition>
    <StyledButton
      v-show="y > SHOW_SCROLL_TO_TOP_OFFSET"
      fixed
      bottom-4
      right-4
      z-5
      :button-props="{ icon: 'mdi-chevron-up' }"
      @click="goTo(0)"
    />
  </v-fade-transition>
</template>
