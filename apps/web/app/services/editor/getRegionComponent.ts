import type { EditorRegistry } from "@/models/editor/EditorRegistry";
import type { ResolvedRegion } from "vue-editor-layout-headless";

// The component a region draws: the one its active panel's content key names in the registry, or none when the region
// Holds no panel the registry has an entry for, which the layout check reports
export const getRegionComponent = (region: ResolvedRegion, registry: EditorRegistry): Component | undefined => {
  const activePanel = region.panels.find((panel) => panel.id === region.activePanelId);
  return activePanel ? registry[activePanel.contentKey] : undefined;
};
