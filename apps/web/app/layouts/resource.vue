<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  isServiceMenuShown?: true;
  title?: string;
}

const slots = defineSlots<{
  default?: () => VNode;
  // The title row whole, for a page whose title carries more than a name: a resource's type, its commands
  heading?: () => VNode;
  // The page's own sections as tab links, whose line closes the header
  navigation?: () => VNode;
}>();
const { isServiceMenuShown, title } = defineProps<Props>();
const isServiceMenuOpen = ref(false);
</script>

<!-- The header every resource page shares, as a page header has it: the trail back with the storage meter on its far
     end, then the page's title, then its sections. The meter lives here rather than in the dock because storage is
     what this area spends — it belongs where uploads happen, not in chrome every route pays for. Home opts the
     service menu in, and its mark rides the trail's row at the end the trail starts from -->
<template>
  <NuxtLayout>
    <div flex flex-col h-full>
      <!-- The header alone is the library's type: a page under it not yet migrated keeps Vuetify's -->
      <header px-4 pt-3 flex flex-col gap-3 ui-body :class="{ 'pb-3': !slots.navigation }">
        <div flex gap-3 min-h-8 items-center>
          <UiIconButton
            v-if="isServiceMenuShown"
            label="Resource menu"
            :meaning="UiIconMeaning.Menu"
            :variant="UiButtonVariant.Quiet"
            @click="isServiceMenuOpen = !isServiceMenuOpen"
          />
          <AppBreadcrumbs />
          <div ml-a flex min-w-0>
            <ResourceStorageMeter />
          </div>
        </div>
        <slot v-if="slots.heading" name="heading" />
        <h1 v-else-if="title" ui-title>{{ title }}</h1>
        <slot name="navigation" />
      </header>
      <!-- Relative so the drawer overlays this region alone, leaving the header and the app chrome reachable -->
      <div flex flex-1 min-h-0 relative>
        <ResourceServiceMenu v-if="isServiceMenuShown" v-model="isServiceMenuOpen" />
        <div flex flex-1 flex-col min-w-0>
          <slot />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
