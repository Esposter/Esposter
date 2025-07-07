import { JSONClassMap } from "#shared/services/superjson/JSONClassMap";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";

export default definePayloadPlugin(() => {
  for (const [name, cls] of Object.entries(JSONClassMap)) {
    definePayloadReducer(name, (data) => data instanceof cls && data.toJSON());
    definePayloadReviver(name, (data) => new cls(jsonDateParse(data)));
  }
});
