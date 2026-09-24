import { JSONClassMap } from "#shared/services/superjson/JSONClassMap";
import { jsonDateParse } from "@esposter/shared";

export default definePayloadPlugin(() => {
  for (const [name, JsonClass] of Object.entries(JSONClassMap)) {
    definePayloadReducer(name, (data) => data instanceof JsonClass && JSON.stringify(data));
    definePayloadReviver(name, (data) => new JsonClass(jsonDateParse(data)));
  }
});
