<script setup lang="ts">
import { EditorType } from "#src/models/editor/EditorType";
import { DashboardEditorRegionNameMap } from "#src/services/dashboard/editor/DashboardEditorRegionNameMap";
import { DashboardEditorRegistry } from "#src/services/dashboard/editor/DashboardEditorRegistry";
import { DashboardLayout } from "#src/services/dashboard/editor/DashboardLayout";
import { getDashboardEditorContext } from "#src/services/dashboard/editor/getDashboardEditorContext";
import { findVisual } from "#src/services/dashboard/visual/findVisual";
import { useDashboardStore } from "#src/store/dashboard/index";
import { useVisualStore } from "#src/store/dashboard/visual";

const dashboardStore = useDashboardStore();
const { loadContent, saveDashboard } = dashboardStore;
const { dashboard } = storeToRefs(dashboardStore);
const visualStore = useVisualStore();
const { selectedVisualId, visuals } = storeToRefs(visualStore);
// The layout reads what is selected, so the inspector shows the form or the title of the one visual that is
const selectedVisual = computed(() => findVisual(visuals.value, { id: selectedVisualId.value }));
const context = computed(() => getDashboardEditorContext(selectedVisual.value));
await loadContent();
// Layout drags and visual edits mutate the dashboard in place, so the watch has to be deep — and the
// Store seeds the dirty check with what it just read, so this first deep fire compares equal and saves nothing
watchAutosave(dashboard, saveDashboard);
</script>

<template>
  <!-- Each region holds one panel, which takes the region's id, so the region's name is the panel's name too -->
  <EditorShell
    :context
    :editor-type="EditorType.Dashboard"
    :layout="DashboardLayout"
    :panel-name-map="DashboardEditorRegionNameMap"
    :region-name-map="DashboardEditorRegionNameMap"
    :registry="DashboardEditorRegistry"
  >
    <DashboardEditorContent />
  </EditorShell>
</template>
