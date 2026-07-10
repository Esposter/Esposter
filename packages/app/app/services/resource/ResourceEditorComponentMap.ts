import ResourceDashboardEditor from "@/components/Resource/Dashboard/Editor.vue";
import ResourceEmailEditor from "@/components/Resource/Email/Editor.vue";
import ResourceFlowchartEditor from "@/components/Resource/Flowchart/Editor.vue";
import ResourceWebpageEditor from "@/components/Resource/Webpage/Editor.vue";
import { ResourceType } from "@esposter/db-schema";
// The component rendered inside the built-in Editor blade as each editor migrates off its top-level page
// (roadmap Phase 3-5). Types absent here fall back to the EditorLaunch panel that deep-links the legacy page.
export const ResourceEditorComponentMap: Partial<Record<ResourceType, Component>> = {
  [ResourceType.Dashboard]: ResourceDashboardEditor,
  [ResourceType.Email]: ResourceEmailEditor,
  [ResourceType.Flowchart]: ResourceFlowchartEditor,
  [ResourceType.Webpage]: ResourceWebpageEditor,
};
