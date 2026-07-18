import ResourceBlueprintEditor from "@/components/Resource/Blueprint/Editor.vue";
import ResourceDashboardEditor from "@/components/Resource/Dashboard/Editor.vue";
import ResourceEmailEditor from "@/components/Resource/Email/Editor.vue";
import ResourceFlowchartEditor from "@/components/Resource/Flowchart/Editor.vue";
import ResourceSurveyEditor from "@/components/Resource/Survey/Editor.vue";
import ResourceWebpageEditor from "@/components/Resource/Webpage/Editor.vue";
import { ResourceType } from "@esposter/db-schema";
// The component rendered inside the built-in Editor blade; blade-only types (File/TodoList) have no entry,
// So their nav skips the Editor blade entirely.
export const ResourceEditorComponentMap: Partial<Record<ResourceType, Component>> = {
  [ResourceType.Blueprint]: ResourceBlueprintEditor,
  [ResourceType.Dashboard]: ResourceDashboardEditor,
  [ResourceType.Email]: ResourceEmailEditor,
  [ResourceType.Flowchart]: ResourceFlowchartEditor,
  [ResourceType.Survey]: ResourceSurveyEditor,
  [ResourceType.Webpage]: ResourceWebpageEditor,
};
