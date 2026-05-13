<script setup lang="ts">
const callControlItems = useCallControlItems();
</script>

<template>
  <div pb-4 flex justify-center>
    <StyledCard px-4 py-2 rd-full flex gap-x-2 items-center>
      <v-tooltip
        v-for="{ tooltip, icon, color, variant, onClick } of callControlItems"
        :key="tooltip"
        :text="tooltip"
        location="top"
      >
        <template #activator="{ props }">
          <v-btn :="props" :icon :color size="default" :variant :ripple="false" @click="onClick()" />
        </template>
      </v-tooltip>
    </StyledCard>
  </div>
</template>
