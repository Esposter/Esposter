<script setup lang="ts">
import type { TextEventEmitsOptions, TextProps } from "vue-phaser";

import { FontKey } from "@/models/dungeons/keys/FontKey";
import { Text } from "vue-phaser";

interface TextEmits extends /** @vue-ignore */ TextEventEmitsOptions {}

const { configuration, ...rest } = defineProps<TextProps>();
const emit = defineEmits<TextEmits>();
</script>

<template>
  <Text
    :="rest"
    :configuration="{ ...configuration, style: { fontStyle: FontKey.KenneyFutureNarrow, ...configuration.style } }"
    @="emit"
  />
</template>
