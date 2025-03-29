import type { Serializable } from "#shared/models/entity/Serializable";
import type { Class } from "type-fest";

import { ClickerGame } from "#shared/models/clicker/data/ClickerGame";
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { MessageEntity } from "#shared/models/db/message/MessageEntity";
import { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { MessageReplyMetadataEntity } from "#shared/models/db/message/metadata/MessageReplyMetadataEntity";
import { DungeonsGame } from "#shared/models/dungeons/data/DungeonsGame";
import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { FlowchartEditor } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { TableEditor } from "#shared/models/tableEditor/TableEditor";
import { TableEditorConfiguration } from "#shared/models/tableEditor/TableEditorConfiguration";
import { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";

export const JSONClassMap = {
  ClickerGame,
  Dashboard,
  DungeonsGame,
  EmailEditor,
  FlowchartEditor,
  MessageEmojiMetadataEntity,
  MessageEntity,
  MessageReplyMetadataEntity,
  TableEditor,
  TableEditorConfiguration,
  TodoListItem,
  VuetifyComponentItem,
  WebpageEditor,
} as const satisfies Record<string, Class<Serializable>>;
