import type { Serializable } from "@esposter/shared";
import type { Class } from "type-fest";

import { Clicker } from "#shared/models/clicker/data/Clicker";
import { BasicChartConfiguration } from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import { Chart } from "#shared/models/dashboard/data/chart/Chart";
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { Dungeons } from "#shared/models/dungeons/data/Dungeons";
import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { FlowchartEditor } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { TableEditor } from "#shared/models/tableEditor/data/TableEditor";
import { TableEditorConfiguration } from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { TodoListItem } from "#shared/models/tableEditor/todoList/TodoListItem";
import { VuetifyComponentItem } from "#shared/models/tableEditor/vuetifyComponent/VuetifyComponentItem";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { StandardMessageEntity, SurveyResponseEntity, WebhookMessageEntity } from "@esposter/db-schema";

export const JSONClassMap: Record<string, Class<Serializable>> = {
  StandardMessageEntity,
  BasicChartConfiguration,
  Chart,
  Clicker,
  Dashboard,
  Dungeons,
  EmailEditor,
  FlowchartEditor,
  MessageEmojiMetadataEntity,
  SurveyResponseEntity,
  TableEditor,
  TableEditorConfiguration,
  TodoListItem,
  Visual,
  VuetifyComponentItem,
  WebhookMessageEntity,
  WebpageEditor,
};
