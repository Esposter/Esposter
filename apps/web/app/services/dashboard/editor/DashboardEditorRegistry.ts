import type { EditorRegistry } from "@/models/editor/EditorRegistry";

import DashboardEditorGroupForm from "@/components/Dashboard/Editor/GroupForm.vue";
import DashboardEditorHeader from "@/components/Dashboard/Editor/Header.vue";
import DashboardEditorPalette from "@/components/Dashboard/Editor/Palette.vue";
import DashboardEditorSettings from "@/components/Dashboard/Editor/Settings.vue";
import DashboardEditorVisualForm from "@/components/Dashboard/Editor/VisualForm.vue";
import { DashboardEditorContent } from "@/models/dashboard/DashboardEditorContent";

// The component each content key of the dashboard's layout draws. The layout check reports a key the layout names with no entry here
export const DashboardEditorRegistry = {
  [DashboardEditorContent.Bar]: DashboardEditorHeader,
  [DashboardEditorContent.GroupForm]: DashboardEditorGroupForm,
  [DashboardEditorContent.Palette]: DashboardEditorPalette,
  [DashboardEditorContent.Settings]: DashboardEditorSettings,
  [DashboardEditorContent.VisualForm]: DashboardEditorVisualForm,
} as const satisfies EditorRegistry;
