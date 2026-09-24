<script setup lang="ts">
import type { UiMenuItem } from "@/models/ui/UiMenuItem";

import { ResourceHomeTab, ResourceHomeTabs } from "@/models/resource/ResourceHomeTab";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useFavoriteStore } from "@/store/resource/favorite";
import { RoutePath } from "@esposter/shared";

const tab = useEnumRouteQuery("tab", ResourceHomeTabs, ResourceHomeTab.Recent);
const items: UiMenuItem<ResourceHomeTab>[] = [
  { title: "Recent", value: ResourceHomeTab.Recent },
  { title: "Favorites", value: ResourceHomeTab.Favorites },
];
const favoriteStore = useFavoriteStore();
const { readFavorites } = favoriteStore;
// Every row's context menu says whether it is a favorite, on the Recent tab too, so the set is read with the section;
// The read is cached, so the Favorites tab's own read shares it
onMounted(async () => {
  await readFavorites();
});
</script>

<!-- Home's preview of the two sets the service menu gives full list routes. Each tab is the top few rows; See all opens
     the workbench where they can be filtered, sorted and acted on in bulk -->
<template>
  <section flex flex-col gap-3>
    <div flex gap-3 items-center justify-between>
      <h2 truncate ui-heading>Resources</h2>
      <UiButtonLink :to="RoutePath.ResourceExplorerAll" :variant="UiButtonVariant.Quiet">
        See all
        <UiIcon :meaning="UiIconMeaning.Next" />
      </UiButtonLink>
    </div>
    <UiTabs v-model="tab" :items label="Resources">
      <template #default="{ value }">
        <ResourceHomeRecentsList v-if="value === ResourceHomeTab.Recent" />
        <ResourceHomeFavoritesList v-else />
      </template>
    </UiTabs>
  </section>
</template>
