<script setup lang="ts">
import buySfx from "@/assets/clicker/sound/buy.mp3";
import type { Upgrade } from "@/models/clicker";
import DOMPurify from "dompurify";
import { marked } from "marked";

interface UpgradeListItemProps {
  upgrade: Upgrade;
}

const props = defineProps<UpgradeListItemProps>();
const { upgrade } = $(toRefs(props));
const { play } = useSound(buySfx);
const sanitizedUpgradeDescription = $computed(() => DOMPurify.sanitize(marked.parse(upgrade.description)));
</script>

<!-- @NOTE: https://github.com/vuetifyjs/vuetify/issues/15307 -->
<!-- v-menu renders buttons twice in SSR -->
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
        <StyledButton @click="play">Buy</StyledButton>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>
