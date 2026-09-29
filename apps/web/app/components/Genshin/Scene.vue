<script setup lang="ts">
import type { QualityTier } from "genshin-engine";

import { OrbitControls } from "@tresjs/cientos";

interface Props {
  qualityTier: QualityTier;
}

const { qualityTier } = defineProps<Props>();
</script>

<template>
  <TresPerspectiveCamera :far="2000" :fov="45" :look-at="[0, 14, 0]" :position="[62, 26, 58]" />
  <OrbitControls
    make-default
    :max-distance="220"
    :max-polar-angle="Math.PI * 0.47"
    :min-distance="12"
    :target="[0, 14, 0]"
  />
  <GenshinWindrise :quality-tier />
</template>
