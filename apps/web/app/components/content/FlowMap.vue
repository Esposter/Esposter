<script setup lang="ts">
import flowMap from "@/generated/flowMap/flowMap.mmd?raw";
</script>

<template>
  <DocsMermaid :code="flowMap" />
</template>
