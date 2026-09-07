<script setup lang="ts">
import { SHOW_SCROLL_TO_TOP_OFFSET } from "@/services/app/constants";

const { y } = useWindowScroll();
const goTo = useVGoTo();
</script>

<template>
  <v-fade-transition>
    <StyledButton
      v-show="y > SHOW_SCROLL_TO_TOP_OFFSET"
      bottom-4
      right-4
      fixed
      z-5
      :button-props="{ icon: 'mdi-chevron-up' }"
      @click="goTo(0)"
    />
  </v-fade-transition>
</template>
