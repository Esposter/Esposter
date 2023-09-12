import { Game } from "@/models/clicker/Game";
import { TableEditorConfiguration } from "@/models/tableEditor/TableEditorConfiguration";
import { RegisterSuperJSON } from "@/services/superjson/RegisterSuperJSON";

export default definePayloadPlugin(() => {
  // Change this to use class decorators when it is supported
  // https://github.com/nuxt/nuxt/issues/14126
  RegisterSuperJSON(Game);
  definePayloadReducer("Game", (data) => data instanceof Game && data.toJSON());
  definePayloadReviver("Game", (data) => new Game(jsonDateParse(data)));

  RegisterSuperJSON(TableEditorConfiguration);
  definePayloadReducer("TableEditorConfiguration", (data) => data instanceof TableEditorConfiguration && data.toJSON());
  definePayloadReviver("TableEditorConfiguration", (data) => new TableEditorConfiguration(jsonDateParse(data)));
});
