<script setup lang="ts">
import { BUY_QUANTITIES } from "@/services/clicker/constants";
import { useBuildingStore } from "@/store/clicker/building";

const buildingStore = useBuildingStore();
const { buyQuantity } = storeToRefs(buildingStore);
</script>

<template>
  <div>
    <div font-bold flex justify-center text-headline-large>Store</div>
    <div pt-2 flex justify-center>
      <v-btn-toggle v-model="buyQuantity" density="compact" mandatory>
        <v-btn v-for="quantity of BUY_QUANTITIES" :key="quantity" :value="quantity" :text="`×${quantity}`" />
      </v-btn-toggle>
    </div>
  </div>
</template>
