<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { SCROLL_TO_TOP_VISIBLE_OFFSET } from "@/services/app/constants";

const { y } = useWindowScroll();
const scrollToTop = () => {
  window.scrollTo({ behavior: "smooth", top: 0 });
};
</script>

<template>
  <UiIconButton
    v-show="y > SCROLL_TO_TOP_VISIBLE_OFFSET"
    label="Scroll to top"
    :meaning="UiIconMeaning.ScrollToTop"
    right-4
    fixed
    z-5
    bottom="[calc(var(--dock-inset-block-end)+1rem)]"
    @click="scrollToTop()"
  />
</template>
