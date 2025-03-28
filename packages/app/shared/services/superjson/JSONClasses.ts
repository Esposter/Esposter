import type { Serializable } from "#shared/models/entity/Serializable";
import type { Class } from "type-fest";

import { ClickerGame } from "#shared/models/clicker/data/ClickerGame";
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { DungeonsGame } from "#shared/models/dungeons/data/DungeonsGame";
import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { FlowchartEditor } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { TableEditor } from "#shared/models/tableEditor/TableEditor";
import { TableEditorConfiguration } from "#shared/models/tableEditor/TableEditorConfiguration";
import { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";

export const JSONClasses = [
  { cls: ClickerGame, name: "ClickerGame" },
  { cls: Dashboard, name: "Dashboard" },
  { cls: DungeonsGame, name: "DungeonsGame" },
  { cls: EmailEditor, name: "EmailEditor" },
  { cls: FlowchartEditor, name: "FlowchartEditor" },
  { cls: TableEditor, name: "TableEditor" },
  { cls: TableEditorConfiguration, name: "TableEditorConfiguration" },
  { cls: TodoListItem, name: "TodoListItem" },
  { cls: VuetifyComponentItem, name: "VuetifyComponentItem" },
  { cls: WebpageEditor, name: "WebpageEditor" },
] as const satisfies { cls: Class<Serializable>; name: string }[];
