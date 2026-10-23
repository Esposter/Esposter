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
import { BooleanColumn } from "#shared/models/resource/sheet/column/BooleanColumn";
import { ComputedColumn } from "#shared/models/resource/sheet/column/ComputedColumn";
import { DateColumn } from "#shared/models/resource/sheet/column/DateColumn";
import { NumberColumn } from "#shared/models/resource/sheet/column/NumberColumn";
import { StringColumn } from "#shared/models/resource/sheet/column/StringColumn";
import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { TodoListItem } from "#shared/models/resource/todoList/TodoListItem";
import { WebpageEditor } from "#shared/models/webpageEditor/data/WebpageEditor";
import { StandardMessageEntity, SurveyResponseEntity, WebhookMessageEntity } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";

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

// One process can evaluate this module more than once, as the dev server does, and each evaluation creates its own
// Classes. Every evaluation's map is published on globalThis under a key that survives the re-evaluation, so a lookup
// Covers all of them instead of whichever evaluated last, and the transformer looks a class up by name at check time
// Instead of holding the class itself
const JSON_CLASS_MAPS_KEY = Symbol.for("JSONClassMaps");
const jsonClassMaps: Record<string, Class<Serializable>>[] = Reflect.get(globalThis, JSON_CLASS_MAPS_KEY) ?? [];
Object.assign(globalThis, { [JSON_CLASS_MAPS_KEY]: jsonClassMaps });
jsonClassMaps.push(JSONClassMap);

export const getJSONClasses = (name: string): Class<Serializable>[] =>
  jsonClassMaps.map((jsonClassMap) => takeOne(jsonClassMap, name));

// The newest evaluation's class, which is what a value deserializes into
export const getJSONClass = (name: string): Class<Serializable> =>
  takeOne(getJSONClasses(name), jsonClassMaps.length - 1);
