import { Game as ClickerGame } from "@/models/clicker/data/Game";
import { Dashboard } from "@/models/dashboard/Dashboard";
import { Game as DungeonsGame } from "@/models/dungeons/data/Game";
import { EmailEditor } from "@/models/emailEditor/EmailEditor";
import { FlowchartEditor } from "@/models/flowchartEditor/FlowchartEditor";
import { TableEditorConfiguration } from "@/models/tableEditor/TableEditorConfiguration";
import { jsonDateParse } from "@/shared/util/time/jsonDateParse";

export default definePayloadPlugin(() => {
  definePayloadReducer("ClickerGame", (data) => data instanceof ClickerGame && data.toJSON());
  definePayloadReviver("ClickerGame", (data) => Object.assign(new ClickerGame(), jsonDateParse(data)));

  definePayloadReducer("Dashboard", (data) => data instanceof Dashboard && data.toJSON());
  definePayloadReviver("Dashboard", (data) => Object.assign(new Dashboard(), jsonDateParse(data)));

  definePayloadReducer("DungeonsGame", (data) => data instanceof DungeonsGame && data.toJSON());
  definePayloadReviver("DungeonsGame", (data) => Object.assign(new DungeonsGame(), jsonDateParse(data)));

  definePayloadReducer("EmailEditor", (data) => data instanceof EmailEditor && data.toJSON());
  definePayloadReviver("EmailEditor", (data) => Object.assign(new EmailEditor(), jsonDateParse(data)));

  definePayloadReducer("FlowchartEditor", (data) => data instanceof FlowchartEditor && data.toJSON());
  definePayloadReviver("FlowchartEditor", (data) => Object.assign(new FlowchartEditor(), jsonDateParse(data)));

  definePayloadReducer("TableEditorConfiguration", (data) => data instanceof TableEditorConfiguration && data.toJSON());
  definePayloadReviver("TableEditorConfiguration", (data) =>
    Object.assign(new TableEditorConfiguration(), jsonDateParse(data)),
  );
});
