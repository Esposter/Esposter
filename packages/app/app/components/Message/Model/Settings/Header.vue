<script setup lang="ts">
interface SettingsHeaderProps {
  title: string;
}
// Belongs in the shell's `#header` slot, which renders outside the scroll container — so it stays put without
// `sticky`, and a panel scrolled past it is genuinely out of view rather than hidden underneath it. The Room
// And User dialogs render the same three controls; only what they do on close differs
const { title } = defineProps<SettingsHeaderProps>();
const emit = defineEmits<{ close: []; "open:drawer": [] }>();
const { smAndDown } = useVDisplay();
</script>

<template>
  <v-sheet tag="header" px-4 py-4 flex items-center justify-between>
    <div flex gap-2 items-center>
      <StyledTooltipIconButton v-if="smAndDown" icon="mdi-menu" text="Show menu" @click="emit('open:drawer')" />
      <div font-bold text-headline-medium>{{ title }}</div>
    </div>
    <StyledTooltipIconButton :button-props="{ variant: 'text' }" icon="mdi-close" text="Close" @click="emit('close')" />
  </v-sheet>
</template>
