import type { Serializable } from "@esposter/shared";
import type { Class } from "type-fest";

import { Clicker } from "#shared/models/clicker/data/Clicker";
import { ClickerSave } from "#shared/models/clicker/data/ClickerSave";
import { BasicChartConfiguration } from "#shared/models/dashboard/data/chart/BasicChartConfiguration";
import { Chart } from "#shared/models/dashboard/data/chart/Chart";
import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { Visual } from "#shared/models/dashboard/data/Visual";
import { MessageEmojiMetadataEntity } from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { Dungeons } from "#shared/models/dungeons/data/Dungeons";
import { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import { FlowchartEditor } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { BooleanColumn } from "#shared/models/resource/file/column/BooleanColumn";
import { ComputedColumn } from "#shared/models/resource/file/column/ComputedColumn";
import { DateColumn } from "#shared/models/resource/file/column/DateColumn";
import { NumberColumn } from "#shared/models/resource/file/column/NumberColumn";
import { StringColumn } from "#shared/models/resource/file/column/StringColumn";
import { Row } from "#shared/models/resource/file/datasource/Row";
import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { StandardMessageEntity, SurveyResponseEntity, WebhookMessageEntity } from "@esposter/db-schema";

export const JSONClassMap: Record<string, Class<Serializable>> = {
  BasicChartConfiguration,
  BooleanColumn,
  Chart,
  Clicker,
  ClickerSave,
  ComputedColumn,
  Dashboard,
  DateColumn,
  Dungeons,
  EmailEditor,
  FlowchartEditor,
  MessageEmojiMetadataEntity,
  NumberColumn,
  Row,
  StandardMessageEntity,
  StringColumn,
  SurveyResponseEntity,
  TodoListItem,
  Visual,
  WebhookMessageEntity,
  WebpageEditor,
};
