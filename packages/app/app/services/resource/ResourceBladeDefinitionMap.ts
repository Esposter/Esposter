import type { BladeDefinition } from "@/models/resource/BladeDefinition";

import ResourceFileData from "@/components/Resource/File/Data.vue";
import ResourceFileSettings from "@/components/Resource/File/Settings.vue";
import ResourceSurveyResponses from "@/components/Resource/Survey/Responses.vue";
import ResourceTodoListCalendar from "@/components/Resource/TodoList/Calendar.vue";
import ResourceTodoListItems from "@/components/Resource/TodoList/Items.vue";
import { ResourceType } from "@esposter/db-schema";
// The type's own blades after the built-in Overview/Editor; slugs are route segments on /resources/[id]/[[blade]]
export const ResourceBladeDefinitionMap: Record<ResourceType, BladeDefinition[]> = {
  [ResourceType.Dashboard]: [],
  [ResourceType.Email]: [],
  [ResourceType.File]: [
    { component: ResourceFileData, icon: "mdi-table", slug: "data", title: "Data" },
    { component: ResourceFileSettings, icon: "mdi-cog", slug: "settings", title: "Settings" },
  ],
  [ResourceType.Flowchart]: [],
  [ResourceType.Survey]: [
    { component: ResourceSurveyResponses, icon: "mdi-poll", slug: "responses", title: "Responses" },
  ],
  [ResourceType.TodoList]: [
    { component: ResourceTodoListItems, icon: "mdi-format-list-checks", slug: "items", title: "Items" },
    { component: ResourceTodoListCalendar, icon: "mdi-calendar", slug: "calendar", title: "Calendar" },
  ],
  [ResourceType.Webpage]: [],
};
