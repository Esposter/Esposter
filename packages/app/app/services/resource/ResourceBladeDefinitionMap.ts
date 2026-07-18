import type { BladeDefinition } from "@/models/resource/BladeDefinition";

import ResourceProgramSetup from "@/components/Resource/Program/Setup.vue";
import ResourceProgramStatus from "@/components/Resource/Program/Status.vue";
import ResourceSheetData from "@/components/Resource/Sheet/Data.vue";
import ResourceSheetSettings from "@/components/Resource/Sheet/Settings.vue";
import ResourceSurveyResponses from "@/components/Resource/Survey/Responses.vue";
import ResourceTodoListCalendar from "@/components/Resource/TodoList/Calendar.vue";
import ResourceTodoListItems from "@/components/Resource/TodoList/Items.vue";
import { ResourceType } from "@esposter/db-schema";
// The type's own blades after the built-in Overview/Editor; slugs are route segments on /resources/[id]/[[blade]]
export const ResourceBladeDefinitionMap: Record<ResourceType, BladeDefinition[]> = {
  [ResourceType.Blueprint]: [],
  [ResourceType.Dashboard]: [],
  [ResourceType.Email]: [],
  [ResourceType.Flowchart]: [],
  // Note renders its Tiptap editor inline in the built-in Editor blade, so it declares no extra blades
  [ResourceType.Note]: [],
  // A program has no canvas, so it declares no Editor — Setup and Status are the whole surface
  [ResourceType.Program]: [
    { component: ResourceProgramSetup, icon: "mdi-cog", slug: "setup", title: "Setup" },
    { component: ResourceProgramStatus, icon: "mdi-chart-timeline-variant", slug: "status", title: "Status" },
  ],
  [ResourceType.Sheet]: [
    { component: ResourceSheetData, icon: "mdi-table", slug: "data", title: "Data" },
    { component: ResourceSheetSettings, icon: "mdi-cog", slug: "settings", title: "Settings" },
  ],
  [ResourceType.Survey]: [
    { component: ResourceSurveyResponses, icon: "mdi-poll", slug: "responses", title: "Responses" },
  ],
  [ResourceType.TodoList]: [
    { component: ResourceTodoListItems, icon: "mdi-format-list-checks", slug: "items", title: "Items" },
    { component: ResourceTodoListCalendar, icon: "mdi-calendar", slug: "calendar", title: "Calendar" },
  ],
  [ResourceType.Webpage]: [],
};
