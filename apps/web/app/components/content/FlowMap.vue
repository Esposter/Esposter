<script setup lang="ts">
import flowMap from "#shared/generated/flowMap/flowMap.mmd?raw";
</script>

<template>
  <DocsMermaid :code="flowMap" />
</template>
