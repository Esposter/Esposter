<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

interface ResourceExplorerProps {
  activeBlade: string;
  resource: Resource;
}

// The resource itself is threaded because the page's own guard is what makes it non-optional; everything else
// The blade shows or does — the publication, the loading flag, every write — comes from the resource store
const { activeBlade, resource } = defineProps<ResourceExplorerProps>();
// The blade nav is a rail beside the content on desktop and a dropdown above it where there is no room for one
const { smAndDown } = useVDisplay();
</script>

<!-- One box, not two. A list pane beside the blade duplicated a way back the breadcrumb and the toolbar's
     close ✕ both already give, and it spent width the blade itself uses better -->
<template>
  <v-sheet flex flex-1>
    <!-- min-w-0 lets the box shrink below its content's intrinsic width so wide blades scroll internally -->
    <div b-0 b-border b-solid flex flex-1 flex-col min-w-0>
      <v-toolbar pl-4>
        <ResourceBladeTitle :active-blade :resource />
        <v-spacer />
        <ResourceBladeActions :resource />
      </v-toolbar>
      <div b-0 b-t-1 b-border b-solid flex flex-1 min-w-0 :class="smAndDown ? 'flex-col' : 'flex-row'">
        <ResourceBladeNav :active-blade :resource />
        <div flex-1 min-w-0 overflow-auto>
          <ResourceBladeOutlet :active-blade :resource />
        </div>
      </div>
    </div>
  </v-sheet>
</template>
