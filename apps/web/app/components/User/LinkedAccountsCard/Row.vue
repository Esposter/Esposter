<script setup lang="ts">
import type { ButtonProps } from "@/components/Login/ButtonProps";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { toTitleCase } from "@/util/text/toTitleCase";

interface Props extends ButtonProps {
  isLinked?: true;
  // A link or unlink this row issued is still out, queued behind the other rows' or running
  isPending?: true;
  linkedAccountCount: number;
}

const { isLinked, isPending, linkedAccountCount, logo, provider } = defineProps<Props>();
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
      :is-pending
      :variant="UiButtonVariant.Danger"
      @click="emit('unlink')"
    >
      Unlink
    </UiButton>
    <UiButton v-else :is-pending @click="emit('link')">Link</UiButton>
  </li>
</template>
