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
      <v-menu v-for="upgrade in upgrades" :key="upgrade.name" location="right center">
        <template #activator="{ props }">
          <v-list-item :title="upgrade.name" :="props" />
        </template>
        <v-card>
          <v-card-title font="bold!">
            {{ upgrade.name }}
          </v-card-title>
          <v-card-text>
            {{ upgrade.description }}
            <span pt="4" display="flex" justify="end" font="italic">"{{ upgrade.flavorDescription }}"</span>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <StyledButton>Buy</StyledButton>
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-list-group>
  </v-list>
</template>
