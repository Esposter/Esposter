<script setup lang="ts">
import { RoutePath } from "@esposter/shared";
</script>

<template>
  <v-card>
    <v-card-item>
      <div flex flex-wrap gap-4 items-center justify-between>
        <span text-title-large>Create a resource</span>
        <StyledButton :button-props="{ prependIcon: 'mdi-plus' }" :to="RoutePath.ResourceExplorerCreate">
          Create a resource
        </StyledButton>
      </div>
    </v-card-item>
    <v-card-text>
      <ResourceCreateGallery dense />
    </v-card-text>
  </v-card>
</template>
