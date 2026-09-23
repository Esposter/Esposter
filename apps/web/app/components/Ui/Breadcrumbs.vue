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
  <Breadcrumbs.Root min-w-0 flex-1>
    <!-- Two steps apart, the eight pixels the primitive counts between crumbs when it measures what fits -->
    <Breadcrumbs.List flex flex-nowrap gap-2 items-center>
      <template v-for="({ title, to }, index) of items" :key="title">
        <Breadcrumbs.Divider v-if="index > 0" text-muted flex>
          <UiIcon :meaning="UiIconMeaning.Next" />
        </Breadcrumbs.Divider>
        <Breadcrumbs.Ellipsis v-if="index === 1" flex>
          <Breadcrumbs.Activator #default="{ attrs }" renderless>
            <button :="attrs" :data-variant="UiButtonVariant.Quiet" type="button" ui-button px-1>…</button>
          </Breadcrumbs.Activator>
        </Breadcrumbs.Ellipsis>
        <Breadcrumbs.Item text-nowrap>
          <NuxtLink :to text-info hover:underline>{{ title }}</NuxtLink>
        </Breadcrumbs.Item>
      </template>
    </Breadcrumbs.List>
  </Breadcrumbs.Root>
</template>
