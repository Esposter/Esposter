<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { RoutePath } from "@esposter/shared";
</script>

<!-- A tile per type goes straight to its form, and the one accent action on Home opens the gallery that says what each
     type is for -->
<template>
  <section flex flex-col gap-3>
    <div flex gap-3 items-center justify-between>
      <h2 truncate ui-heading>Create</h2>
      <UiButtonLink :to="RoutePath.ResourceExplorerCreate" :variant="UiButtonVariant.Accent">
        <UiIcon :meaning="UiIconMeaning.Create" />
        Create a resource
      </UiButtonLink>
    </div>
    <ResourceCreateGallery dense />
  </section>
</template>
