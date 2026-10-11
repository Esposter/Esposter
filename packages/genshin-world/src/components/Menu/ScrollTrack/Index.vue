<script setup lang="ts">
interface Props {
  // How far down the track the thumb stands, from 0 to 1 of the track's height that the thumb's top leaves free
  offset: number;
  // The thumb's share of the track: how much of the page it shows, and no thumb at all where it shows all of it
  share: number;
}

const { offset, share } = defineProps<Props>();
</script>

<template>
  <div class="track" aria-hidden="true">
    <div v-if="share < 1" class="thumb" :style="{ height: `${share * 100}%`, top: `${(1 - share) * offset * 100}%` }" />
  </div>
</template>
