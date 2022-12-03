<script setup lang="ts">
import type { Upgrade } from "@/models/clicker";
import DOMPurify from "dompurify";
import { marked } from "marked";

interface UpgradeListItemProps {
  upgrade: Upgrade;
}

const props = defineProps<UpgradeListItemProps>();
const { upgrade } = $(toRefs(props));
const sanitizedUpgradeDescription = $computed(() => DOMPurify.sanitize(marked.parse(upgrade.description)));
</script>

<template>
  <v-menu location="right center">
    <template #activator="{ props: menuProps }">
      <v-list-item :title="upgrade.name" :="menuProps" />
    </template>
    <v-card>
      <v-card-title font="bold!">
        {{ upgrade.name }}
      </v-card-title>
      <v-card-text>
        <!-- eslint-disable-next-line vue/no-v-html vue/no-v-text-v-html-on-component -->
        <div v-html="sanitizedUpgradeDescription" />
        <span pt="4" display="flex" justify="end" font="italic">"{{ upgrade.flavorDescription }}"</span>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <StyledButton>Buy</StyledButton>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
