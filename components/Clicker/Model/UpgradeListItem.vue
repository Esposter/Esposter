<script setup lang="ts">
import buySfx from "@/assets/clicker/sound/buy.mp3";
import type { Upgrade } from "@/models/clicker";
import DOMPurify from "dompurify";
import { marked } from "marked";

interface UpgradeListItemProps {
  upgrade: Upgrade;
  isBought?: boolean;
}

const props = defineProps<UpgradeListItemProps>();
const { upgrade, isBought } = $(toRefs(props));
const { play } = useSound(buySfx);
const sanitizedUpgradeDescription = $computed(() => DOMPurify.sanitize(marked.parse(upgrade.description)));
</script>

<!-- @NOTE: https://github.com/vuetifyjs/vuetify/issues/15307 -->
<!-- v-menu renders buttons twice in SSR -->
<template>
  <v-menu min-width="400" location="right center">
    <template #activator="{ props: menuProps }">
      <v-list-item :title="upgrade.name" :="menuProps" />
    </template>
    <v-card>
      <v-card-title class="text-subtitle-1" display="flex!" font="bold!">
        {{ upgrade.name }}
        <v-spacer />
        {{ upgrade.price }} <ClickerPinaColada width="24" height="24" />
      </v-card-title>
      <v-card-text>
        <!-- eslint-disable-next-line vue/no-v-html vue/no-v-text-v-html-on-component -->
        <div v-html="sanitizedUpgradeDescription" />
        <span pt="4" display="flex" justify="end" font="italic">"{{ upgrade.flavorDescription }}"</span>
      </v-card-text>
      <template v-if="!isBought">
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <StyledButton @click="play">Buy</StyledButton>
        </v-card-actions>
      </template>
    </v-card>
  </v-menu>
</template>
