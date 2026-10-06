<script setup lang="ts">
import type { ResourceInResource } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";

interface Props {
  id: ResourceInResource["id"];
}

const { id } = defineProps<Props>();
const { $trpc } = useNuxtApp();
// Off the blade's Suspense boundary, so a failed read fails inside this card with its retry rather than the blade
const {
  data: references,
  error,
  refresh,
} = useQuery(() => $trpc.resource.readResourceReferences.query({ id }), { isInlineError: true });
</script>

<!-- Both directions of the link index, as Power BI's lineage view puts an item between what feeds it and what it
  feeds. A reference that can no longer be read is counted rather than named: it is the owner's content, but what it
  names is not their resource -->
<template>
  <UiFrame title="Related resources">
    <UiErrorState v-if="error" :error @retry="refresh()" />
    <div v-else-if="references" gap-4 grid md:cols-2>
      <section flex flex-col gap-1>
        <h3 text-sm text-muted>Used by</h3>
        <ResourceLinkedResourceList v-if="references.consumers.length > 0" :resources="references.consumers" />
        <p v-else text-muted>No other resource uses this one.</p>
      </section>
      <section flex flex-col gap-1>
        <h3 text-sm text-muted>Uses</h3>
        <ResourceLinkedResourceList v-if="references.dependencies.length > 0" :resources="references.dependencies" />
        <p v-else-if="references.missingDependencyCount === 0" text-muted>This resource uses no other.</p>
        <p v-if="references.missingDependencyCount > 0" text-sm text-warning>
          {{ references.missingDependencyCount }} referenced
          {{ pluralize("resource", references.missingDependencyCount) }} can't be found — deleted, in the recycle bin,
          or not yours.
        </p>
      </section>
    </div>
    <!-- Each column's heading and a row of its own while the read is out -->
    <div v-else aria-busy="true" gap-4 grid md:cols-2>
      <div v-for="index of 2" :key="index" flex flex-col gap-2>
        <UiSkeleton h-4 w="1/4" />
        <div ui-row>
          <UiSkeleton shrink-0 size-6 />
          <UiSkeleton h-4 w="1/2" />
        </div>
      </div>
    </div>
  </UiFrame>
</template>
