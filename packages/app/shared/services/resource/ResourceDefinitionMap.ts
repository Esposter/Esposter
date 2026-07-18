import type { ResourceDefinition } from "#shared/models/resource/ResourceDefinition";

import { dashboardSchema } from "#shared/models/dashboard/data/Dashboard";
import { emailEditorSchema } from "#shared/models/emailEditor/data/EmailEditor";
import { flowchartEditorSchema } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { blueprintResourceSchema } from "#shared/models/resource/blueprint/BlueprintResource";
import { programResourceSchema } from "#shared/models/resource/program/ProgramResource";
import { sheetResourceSchema } from "#shared/models/resource/sheet/SheetResource";
import { surveyResourceSchema } from "#shared/models/resource/survey/SurveyResource";
import { todoListResourceSchema } from "#shared/models/resource/todoList/TodoListResource";
import { webpageEditorSchema } from "#shared/models/webpageEditor/data/WebpageEditor";
import { ResourceType } from "@esposter/db-schema";

export const ResourceDefinitionMap = {
  [ResourceType.Blueprint]: {
    capabilities: {},
    contentSchema: blueprintResourceSchema,
    icon: "mdi-floor-plan",
    title: ResourceType.Blueprint,
  },
  [ResourceType.Dashboard]: {
    capabilities: { publishable: true },
    contentSchema: dashboardSchema,
    icon: "mdi-view-dashboard-edit",
    title: ResourceType.Dashboard,
  },
  [ResourceType.Email]: {
    capabilities: { fileAssets: true, portable: true, publishable: true },
    contentSchema: emailEditorSchema,
    icon: "mdi-email-edit",
    title: ResourceType.Email,
  },
  [ResourceType.Flowchart]: {
    capabilities: { publishable: true },
    contentSchema: flowchartEditorSchema,
    icon: "mdi-sitemap",
    title: ResourceType.Flowchart,
  },
  [ResourceType.Program]: {
    capabilities: { datasetProvider: true },
    contentSchema: programResourceSchema,
    icon: "mdi-bullhorn",
    title: ResourceType.Program,
  },
  [ResourceType.Sheet]: {
    capabilities: { datasetProvider: true, portable: true },
    contentSchema: sheetResourceSchema,
    icon: "mdi-table",
    title: ResourceType.Sheet,
  },
  [ResourceType.Survey]: {
    capabilities: { datasetProvider: true, fileAssets: true, publishable: true },
    contentSchema: surveyResourceSchema,
    icon: "mdi-clipboard-list",
    title: ResourceType.Survey,
  },
  [ResourceType.TodoList]: {
    capabilities: {},
    contentSchema: todoListResourceSchema,
    icon: "mdi-format-list-checks",
    title: "Todo List",
  },
  [ResourceType.Webpage]: {
    capabilities: { fileAssets: true, publishable: true },
    contentSchema: webpageEditorSchema,
    icon: "mdi-language-html5",
    title: ResourceType.Webpage,
  },
} as const satisfies Record<ResourceType, ResourceDefinition>;
