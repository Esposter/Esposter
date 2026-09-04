<script setup lang="ts">
import type { ButtonProps } from "@/components/Login/ButtonProps";

import { toTitleCase } from "@/util/text/toTitleCase";

interface Props extends ButtonProps {
  isLinked?: true;
  linkedAccountCount: number;
}

const { isLinked, linkedAccountCount, logo, logoAttrs, logoStyle, provider, style } = defineProps<Props>();
const emit = defineEmits<{ link: []; unlink: [] }>();
</script>

<template>
  <v-list-item px-4>
    <template #prepend>
      <div
        mr-4
        rd
        flex
        size-12
        items-center
        justify-center
        overflow-hidden
        :style="{ backgroundColor: style?.backgroundColor }"
      >
        <component :is="logo" :style="{ ...logoStyle }" w-8 :="{ ...logoAttrs }" />
      </div>
    </template>
    <v-list-item-title>{{ toTitleCase(provider) }}</v-list-item-title>
    <v-list-item-subtitle v-if="!isLinked">Not linked</v-list-item-subtitle>
    <v-list-item-subtitle v-else-if="linkedAccountCount === 1">
      Linked — your only way back into this account
    </v-list-item-subtitle>
    <v-list-item-subtitle v-else>Linked</v-list-item-subtitle>
    <template #append>
      <v-btn v-if="isLinked" color="error" :disabled="linkedAccountCount === 1" text="Unlink" @click="emit('unlink')" />
      <StyledButton v-else :button-props="{ text: 'Link' }" @click="emit('link')" />
    </template>
  </v-list-item>
</template>
