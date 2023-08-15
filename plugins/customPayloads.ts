import { Game } from "@/models/clicker/Game";

export default definePayloadPlugin(() => {
  definePayloadReducer("Game", (data) => data instanceof Game && JSON.stringify(data.toJSON()));
  definePayloadReviver("Game", (data) => new Game(JSON.parse(data)));
});
