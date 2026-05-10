import { JSONClassMap } from "#shared/services/superjson/JSONClassMap";
import { jsonDateParse } from "@esposter/shared";

export default definePayloadPlugin(() => {
  for (const [name, cls] of Object.entries(JSONClassMap)) {
    definePayloadReducer(name, (data) => data instanceof cls && JSON.stringify(data));
    definePayloadReviver(name, (data) => new cls(jsonDateParse(data)));
  }
});
