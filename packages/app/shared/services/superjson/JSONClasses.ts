import type { Serializable } from "#shared/models/entity/Serializable";
import type { Constructor } from "type-fest";

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
  { cls: ClickerGame, name: ClickerGame.name },
  { cls: Dashboard, name: Dashboard.name },
  { cls: DungeonsGame, name: DungeonsGame.name },
  { cls: EmailEditor, name: EmailEditor.name },
  { cls: FlowchartEditor, name: FlowchartEditor.name },
  { cls: TableEditor, name: TableEditor.name },
  { cls: TableEditorConfiguration, name: TableEditorConfiguration.name },
  { cls: TodoListItem, name: TodoListItem.name },
  { cls: VuetifyComponentItem, name: VuetifyComponentItem.name },
  { cls: WebpageEditor, name: WebpageEditor.name },
] satisfies { cls: Constructor<Serializable>; name: string }[];
