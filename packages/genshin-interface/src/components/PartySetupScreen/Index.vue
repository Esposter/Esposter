<script setup lang="ts">
import type { PartySetupSlot } from "#src/models/PartySetupSlot";

import PartySetupScreenFoot from "#src/components/PartySetupScreen/Foot/Index.vue";
import PartySetupScreenHead from "#src/components/PartySetupScreen/Head/Index.vue";
import PartySetupScreenTeam from "#src/components/PartySetupScreen/Team/Index.vue";

interface Props {
  // The words of the buttons in the reader's language
  backLabel: string;
  configureTeamLabel: string;
  deployLabel: string;
  // The party the next arrow steps to, and the one the previous arrow steps to, named in the reader's language
  nextLabel: string;
  previousLabel: string;
  quickSetupLabel: string;
  // The words of the Elemental Resonance button at the top right, in the reader's language
  resonanceLabel: string;
  // The team on the screen: its name and its four slots in slot order
  slots: PartySetupSlot[];
  teamName: string;
  // The screen's title, the game's own words for Party Setup
  title: string;
}

defineProps<Props>();
const emit = defineEmits<{ close: []; configureTeam: []; deploy: []; next: []; previous: []; quickSetup: [] }>();
</script>

<template>
  <!-- Party Setup as the English PC client draws it at 1080 high, its positions measured off the frame: the title, the step
       dots, Elemental Resonance and Close at the top, the team's four members across the middle with a name plate over each
       (its element's mark, its name and its level), the arrows at either edge to step to another team, and the foot's team
       name, Configure Team, Quick Setup and Deploy. The members' art is the frame's own, drawn by no piece here -->
  <div class="party-setup-screen">
    <PartySetupScreenHead :back-label :resonance-label :title @close="emit('close')" />
    <PartySetupScreenTeam :next-label :previous-label :slots @next="emit('next')" @previous="emit('previous')" />
    <PartySetupScreenFoot
      :configure-team-label
      :deploy-label
      :quick-setup-label
      :team-name
      @configure-team="emit('configureTeam')"
      @deploy="emit('deploy')"
      @quick-setup="emit('quickSetup')"
    />
  </div>
</template>

<style scoped>
.party-setup-screen {
  position: absolute;
  inset: 0;
  color: #eef8ff;
  font-weight: 600;
}
</style>
