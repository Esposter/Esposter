import type { Component } from "vue";

import ResourceFlowchartEditor from "@/components/Resource/Flowchart/Editor.vue";
import { ResourceType } from "@esposter/db-schema";
// The component rendered inside the built-in Editor blade as each editor migrates off its top-level page
// (roadmap Phase 3-5). Types absent here fall back to the EditorLaunch panel that deep-links the legacy page.
export const ResourceEditorComponentMap: Partial<Record<ResourceType, Component>> = {
  [ResourceType.Flowchart]: ResourceFlowchartEditor,
};
