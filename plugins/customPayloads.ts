import { Game } from "@/models/clicker/Game";
import { TableEditorConfiguration } from "@/models/tableEditor/TableEditorConfiguration";

export default definePayloadPlugin(() => {
  definePayloadReducer("Game", (data) => data instanceof Game && data.toJSON());
  definePayloadReviver("Game", (data) => new Game(jsonDateParse(data)));

  definePayloadReducer("TableEditorConfiguration", (data) => data instanceof TableEditorConfiguration && data.toJSON());
  definePayloadReviver("TableEditorConfiguration", (data) => new TableEditorConfiguration(jsonDateParse(data)));
});
