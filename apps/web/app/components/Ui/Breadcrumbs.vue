<script setup lang="ts">
import type { UiBreadcrumb } from "@/models/ui/UiBreadcrumb";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { Breadcrumbs } from "@vuetify/v0";

interface Props {
  items: UiBreadcrumb[];
}
// A trail of links back, in a navigation landmark. One too long for its row keeps its first and last crumbs and folds
// The middle behind a button that lays them back out in place
const { items } = defineProps<Props>();
</script>

<template>
  <Breadcrumbs.Root flex-1 min-w-0>
    <!-- Two steps apart, the eight pixels the primitive counts between crumbs when it measures what fits. An ordered
         list, so its markers go: a crumb's place is the trail's order, never a number -->
    <Breadcrumbs.List m-0 p-0 list-none flex flex-nowrap gap-2 items-center>
      <template v-for="({ title, to }, index) of items" :key="index">
        <Breadcrumbs.Divider v-if="index > 0" text-muted flex>
          <UiIcon :meaning="UiIconMeaning.Next" />
        </Breadcrumbs.Divider>
        <Breadcrumbs.Ellipsis v-if="index === 1" flex>
          <Breadcrumbs.Activator #default="{ attrs }" renderless>
            <button :="attrs" :data-variant="UiButtonVariant.Quiet" type="button" ui-button px-1>…</button>
          </Breadcrumbs.Activator>
        </Breadcrumbs.Ellipsis>
        <Breadcrumbs.Item text-nowrap>
          <!-- A link, tinted behind while hovered as a quiet button is, so the crumb under the pointer reads as a target -->
          <NuxtLink
            :to
            class="crumb"
            rd="[var(--ui-control-radius)]"
            text-info
            px-2
            py-1
            hover:underline
            hover:bg="[color-mix(in_srgb,var(--ui-tint)_10%,transparent)]"
            >{{ title }}</NuxtLink
          >
        </Breadcrumbs.Item>
      </template>
    </Breadcrumbs.List>
  </Breadcrumbs.Root>
</template>

<style scoped>
.crumb {
  transition: background-color var(--ui-motion-short);
}
</style>
