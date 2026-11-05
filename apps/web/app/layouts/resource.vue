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
      <header px-4 pt-2 flex flex-col gap-2 ui-body :class="{ 'pb-2': !slots.navigation }">
        <!-- The trail and its menu are one group with a width of its own, so the meter sits at the row's end while both
             Fit and takes a line of its own under the trail when they do not, never laid over it -->
        <div flex flex-wrap gap-2 min-h-8 items-center>
          <div flex grow basis-64 gap-2 min-w-0 items-center>
            <UiIconButton
              v-if="isServiceMenuShown"
              label="Resource menu"
              :meaning="UiIconMeaning.Menu"
              :variant="UiButtonVariant.Quiet"
              @click="isServiceMenuOpen = !isServiceMenuOpen"
            />
            <AppBreadcrumbs />
          </div>
          <ResourceStorageMeter />
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
