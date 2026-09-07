<script setup lang="ts">
import { ResourceHomeTab, ResourceHomeTabs } from "@/models/resource/ResourceHomeTab";
import { RoutePath } from "@esposter/shared";

const tab = useEnumRouteQuery("tab", ResourceHomeTabs, ResourceHomeTab.Recent);
</script>

<!-- Home's preview of the two sets the service menu gives full list routes. Each tab is the top few rows;
     See all opens the workbench where they can be filtered, sorted and acted on in bulk -->
<template>
  <v-card>
    <v-card-item>
      <div flex flex-wrap gap-4 items-center justify-between>
        <span text-title-large>Resources</span>
        <v-btn :to="RoutePath.ResourceExplorerAll" append-icon="mdi-arrow-right" variant="text">See all</v-btn>
      </div>
    </v-card-item>
    <v-tabs v-model="tab">
      <v-tab :value="ResourceHomeTab.Recent">Recent</v-tab>
      <v-tab :value="ResourceHomeTab.Favorites">Favorites</v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item :value="ResourceHomeTab.Recent">
        <ResourceHomeRecentsList />
      </v-tabs-window-item>
      <v-tabs-window-item :value="ResourceHomeTab.Favorites">
        <ResourceHomeFavoritesList />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-card>
</template>
