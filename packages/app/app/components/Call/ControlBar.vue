<script setup lang="ts">
const callControlItems = useCallControlItems();
</script>

<template>
  <div py-4 flex justify-center>
    <div bg-grey-darken-4 px-4 py-2 rd-full flex gap-2 items-center style="background-color: rgba(66, 66, 66, 0.9)">
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
  </div>
</template>
