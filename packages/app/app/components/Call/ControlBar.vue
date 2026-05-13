<script setup lang="ts">
const callControlItems = useCallControlItems();
</script>

<template>
  <StyledCard flex justify-center>
    <div px-4 py-2 rd-full flex gap-2 items-center>
      <v-tooltip
        v-for="{ tooltip, icon, color, variant, onClick } of callControlItems"
        :key="tooltip"
        :text="tooltip"
        location="top"
      >
        <template #activator="{ props }">
          <v-btn :="props" :icon :color size="default" :variant :ripple="false" @click="onClick" />
        </template>
      </v-tooltip>
    </div>
  </StyledCard>
</template>
