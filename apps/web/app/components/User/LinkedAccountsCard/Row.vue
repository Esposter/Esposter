<script setup lang="ts">
import type { ButtonProps } from "@/components/Login/ButtonProps";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { toTitleCase } from "@/util/text/toTitleCase";

// Every sign-in button prop is declared, so the brand styling the row does not draw never falls through onto it
interface Props extends ButtonProps {
  isLinked?: true;
  linkedAccountCount: number;
}

const { isLinked, linkedAccountCount, logo, provider } = defineProps<Props>();
const emit = defineEmits<{ link: []; unlink: [] }>();
</script>

<template>
  <li ui-row>
    <UiItemContent
      :description="
        !isLinked ? 'Not linked' : linkedAccountCount === 1 ? 'Linked — your only way back into this account' : 'Linked'
      "
      :title="toTitleCase(provider)"
    >
      <template #mark>
        <component :is="logo" size-6 fill-current />
      </template>
    </UiItemContent>
    <UiButton
      v-if="isLinked"
      :disabled="linkedAccountCount === 1"
      :variant="UiButtonVariant.Danger"
      @click="emit('unlink')"
    >
      Unlink
    </UiButton>
    <UiButton v-else @click="emit('link')">Link</UiButton>
  </li>
</template>
