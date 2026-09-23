<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { COMMAND_PALETTE_SHORTCUT } from "@/services/app/constants";
import { useCommandStore } from "@/store/ui/command";

// Drawn as the field it opens, so it reads as search at a glance; the field itself is the palette's
const commandStore = useCommandStore();
const { openCommandPalette } = commandStore;
</script>

<template>
  <UiButton py-1 flex gap-2 items-center @click="openCommandPalette()">
    <UiIcon :meaning="UiIconMeaning.Search" />
    <span text-muted text-left flex-1>Search docs</span>
    <UiShortcut :shortcut="COMMAND_PALETTE_SHORTCUT" />
  </UiButton>
</template>
