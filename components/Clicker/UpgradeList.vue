<script setup lang="ts">
const { $client } = useNuxtApp();
const upgrades = await $client.clicker.readUpgrades.query();
</script>

<template>
  <v-list v-if="upgrades">
    <v-list-group>
      <template #activator="{ props }">
        <v-list-item :="props">
          <template #prepend>
            <v-avatar color="background">
              <v-icon icon="mdi-cursor-pointer" />
            </v-avatar>
          </template>
          <v-list-item-title font="bold!">Cursor</v-list-item-title>
        </v-list-item>
      </template>
      <ClickerUpgradeListItem v-for="upgrade in upgrades" :key="upgrade.name" :upgrade="upgrade" />
    </v-list-group>
  </v-list>
</template>
