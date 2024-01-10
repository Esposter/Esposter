import { Game as ClickerGame } from "@/models/clicker/Game";
import { Game as DungeonsGame } from "@/models/dungeons/Game";
import { TableEditorConfiguration } from "@/models/tableEditor/TableEditorConfiguration";
import { jsonDateParse } from "@/util/jsonDateParse";

export default definePayloadPlugin(() => {
  definePayloadReducer("ClickerGame", (data) => data instanceof ClickerGame && data.toJSON());
  definePayloadReviver("ClickerGame", (data) => new ClickerGame(jsonDateParse(data)));

  definePayloadReducer("DungeonsGame", (data) => data instanceof DungeonsGame && data.toJSON());
  definePayloadReviver("DungeonsGame", (data) => new DungeonsGame(jsonDateParse(data)));

  definePayloadReducer("TableEditorConfiguration", (data) => data instanceof TableEditorConfiguration && data.toJSON());
  definePayloadReviver("TableEditorConfiguration", (data) => new TableEditorConfiguration(jsonDateParse(data)));
});
