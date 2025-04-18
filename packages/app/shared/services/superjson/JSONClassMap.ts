import type { Serializable } from "#shared/models/entity/Serializable";
import type { Class } from "type-fest";

import { ClickerGame } from "#shared/models/clicker/data/ClickerGame";
import { BasicChartConfiguration } from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import { Chart } from "#shared/models/dashboard/data/chart/Chart";
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { MessageEntity } from "#shared/models/db/message/MessageEntity";
import { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { DungeonsGame } from "#shared/models/dungeons/data/DungeonsGame";
import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { FlowchartEditor } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { TableEditor } from "#shared/models/tableEditor/TableEditor";
import { TableEditorConfiguration } from "#shared/models/tableEditor/TableEditorConfiguration";
import { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";

export const JSONClassMap = {
  BasicChartConfiguration,
  Chart,
  ClickerGame,
  Dashboard,
  DungeonsGame,
  EmailEditor,
  FlowchartEditor,
  MessageEmojiMetadataEntity,
  MessageEntity,
  TableEditor,
  TableEditorConfiguration,
  TodoListItem,
  Visual,
  VuetifyComponentItem,
  WebpageEditor,
} as const satisfies Record<string, Class<Serializable>>;
