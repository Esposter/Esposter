<script setup lang="ts">
import { useTreeviewItem } from "@vuetify/v0";

// Opens the item it sits in as it mounts: Treeview registers a node's children only once the node is open, so the
// Tree's open-all option never reaches the first level, and a tree is drawn open by each of its items instead
useTreeviewItem("v0:treeview")?.ticket.open();
</script>

<template>
  <span hidden />
</template>
