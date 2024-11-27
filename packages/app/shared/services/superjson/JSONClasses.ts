import type { Serializable } from "@/shared/models/entity/Serializable";
import type { Constructor } from "type-fest";

import { Game as DungeonsGame } from "@/models/dungeons/data/Game";
import { EmailEditor } from "@/models/emailEditor/EmailEditor";
import { FlowchartEditor } from "@/models/flowchartEditor/FlowchartEditor";
import { WebpageEditor } from "@/models/webpageEditor/WebpageEditor";
import { Game as ClickerGame } from "@/shared/models/clicker/data/Game";
import { Dashboard } from "@/shared/models/dashboard/data/Dashboard";
import { TableEditor } from "@/shared/models/tableEditor/TableEditor";
import { TableEditorConfiguration } from "@/shared/models/tableEditor/TableEditorConfiguration";
import { TodoListItem } from "@/shared/models/tableEditor/todoList/TodoListItem";
import { VuetifyComponentItem } from "@/shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";

export const JSONClasses = [
  { cls: ClickerGame, name: "ClickerGame" },
  { cls: Dashboard, name: Dashboard.name },
  { cls: DungeonsGame, name: "DungeonsGame" },
  { cls: EmailEditor, name: EmailEditor.name },
  { cls: FlowchartEditor, name: FlowchartEditor.name },
  { cls: TableEditor, name: TableEditor.name },
  { cls: TableEditorConfiguration, name: TableEditorConfiguration.name },
  { cls: TodoListItem, name: TodoListItem.name },
  { cls: VuetifyComponentItem, name: VuetifyComponentItem.name },
  { cls: WebpageEditor, name: WebpageEditor.name },
] satisfies { cls: Constructor<Serializable>; name: string }[];
