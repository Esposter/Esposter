<script setup lang="ts">
import { SPARK_PHASES } from "#src/services/weapon/constants";

interface Props {
  // The ascension phase the weapon holds, which the left row lights up to; the right row lights one phase further
  ascension: number;
}

defineProps<Props>();
</script>

<template>
  <div class="sparks left-sparks">
    <span v-for="phase in SPARK_PHASES" :key="phase" class="spark" :class="{ lit: phase <= ascension }" />
  </div>
  <div class="sparks right-sparks">
    <span v-for="phase in SPARK_PHASES" :key="phase" class="spark" :class="{ lit: phase <= ascension + 1 }" />
  </div>
</template>

<style scoped>
/* Ascend's header: the phases as sparks, each row of six, the left lit to the weapon's phase and the right to the next */
.sparks {
  position: absolute;
  top: calc(var(--reference-pixel) * 106);
  display: flex;
}

.left-sparks {
  left: calc(var(--reference-pixel) * 1191);
  gap: calc(var(--reference-pixel) * 10);
}

.right-sparks {
  left: calc(var(--reference-pixel) * 1499);
  gap: calc(var(--reference-pixel) * 10);
}

.spark {
  width: calc(var(--reference-pixel) * 31);
  height: calc(var(--reference-pixel) * 31);
  background: #8e8c98;
  clip-path: var(--sparkle-clip-path);
}

.spark.lit {
  background: #fff;
}
</style>
