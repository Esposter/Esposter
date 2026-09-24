<script setup lang="ts">
import type { ButtonProps } from "@/components/Login/ButtonProps";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { toTitleCase } from "@/util/text/toTitleCase";

interface Props extends ButtonProps {
  isLinked?: true;
  linkedAccountCount: number;
}

const { isLinked, linkedAccountCount, logo, logoAttrs, logoStyle, provider, style } = defineProps<Props>();
const emit = defineEmits<{ link: []; unlink: [] }>();
</script>

<template>
  <li flex gap-4 items-center>
    <!-- The provider's own mark on its brand colour, as its sign-in button draws it -->
    <div
      flex
      shrink-0
      size-12
      items-center
      justify-center
      of-hidden
      :style="{ backgroundColor: style?.backgroundColor }"
    >
      <component :is="logo" :style="{ ...logoStyle }" w-8 :="{ ...logoAttrs }" />
    </div>
    <div flex flex-1 flex-col min-w-0>
      <span>{{ toTitleCase(provider) }}</span>
      <span v-if="!isLinked" text-muted>Not linked</span>
      <span v-else-if="linkedAccountCount === 1" text-muted>Linked — your only way back into this account</span>
      <span v-else text-muted>Linked</span>
    </div>
    <UiButton
      v-if="isLinked"
      :disabled="linkedAccountCount === 1"
      :variant="UiButtonVariant.Danger"
      @click="emit('unlink')"
    >
      Unlink
    </UiButton>
    <UiButton v-else :variant="UiButtonVariant.Accent" @click="emit('link')">Link</UiButton>
  </li>
</template>
