<script setup lang="ts">
import { SCROLL_TO_TOP_VISIBLE_OFFSET } from "@/services/app/constants";

const { y } = useWindowScroll();
const goTo = useVGoTo();
</script>

<template>
  <v-fade-transition>
    <StyledButton
      v-show="y > SCROLL_TO_TOP_VISIBLE_OFFSET"
      bottom-4
      right-4
      fixed
      z-5
      :button-props="{ icon: 'i-mdi:chevron-up' }"
      @click="goTo(0)"
    />
  </v-fade-transition>
</template>
