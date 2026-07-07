import type { ResourceDefinition } from "#shared/models/resource/ResourceDefinition";

import { fileResourceSchema } from "#shared/models/resource/file/FileResource";
import { surveyResourceSchema } from "#shared/models/resource/survey/SurveyResource";
import { todoListResourceSchema } from "#shared/models/resource/todoList/TodoListResource";
import { dashboardSchema } from "#shared/models/dashboard/data/Dashboard";
import { emailEditorSchema } from "#shared/models/emailEditor/data/EmailEditor";
import { flowchartEditorSchema } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { tableEditorConfigurationSchema } from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { webpageEditorSchema } from "#shared/models/webpageEditor/data/WebpageEditor";
import { ResourceType } from "@esposter/db-schema";

export const ResourceDefinitionMap = {
  [ResourceType.Dashboard]: {
    capabilities: { publishable: true },
    contentSchema: dashboardSchema,
    icon: "mdi-view-dashboard-edit",
    title: ResourceType.Dashboard,
  },
  [ResourceType.Email]: {
    capabilities: { portable: true },
    contentSchema: emailEditorSchema,
    icon: "mdi-email-edit",
    title: ResourceType.Email,
  },
  [ResourceType.File]: {
    capabilities: { datasetProvider: true, portable: true },
    contentSchema: fileResourceSchema,
    icon: "mdi-file-table",
    title: ResourceType.File,
  },
  [ResourceType.Flowchart]: {
    capabilities: {},
    contentSchema: flowchartEditorSchema,
    icon: "mdi-sitemap",
    title: ResourceType.Flowchart,
  },
  [ResourceType.Survey]: {
    capabilities: { datasetProvider: true, publishable: true },
    contentSchema: surveyResourceSchema,
    icon: "mdi-clipboard-list",
    title: ResourceType.Survey,
  },
  // Transitional: dies with the File/TodoList split (platform roadmap Phase 4)
  [ResourceType.Table]: {
    capabilities: {},
    contentSchema: tableEditorConfigurationSchema,
    icon: "mdi-table-edit",
    title: ResourceType.Table,
  },
  [ResourceType.TodoList]: {
    capabilities: {},
    contentSchema: todoListResourceSchema,
    icon: "mdi-format-list-checks",
    title: "Todo List",
  },
  [ResourceType.Webpage]: {
    capabilities: { publishable: true },
    contentSchema: webpageEditorSchema,
    icon: "mdi-language-html5",
    title: ResourceType.Webpage,
  },
} as const satisfies Record<ResourceType, ResourceDefinition>;
