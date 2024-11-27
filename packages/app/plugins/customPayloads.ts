import { JSONClasses } from "@/shared/services/superjson/JSONClasses";
import { jsonDateParse } from "@/shared/util/time/jsonDateParse";

export default definePayloadPlugin(() => {
  for (const { cls, name } of JSONClasses) {
    definePayloadReducer(name, (data) => data instanceof cls && data.toJSON());
    definePayloadReviver(name, (data) => Object.assign(new cls(), jsonDateParse(data)));
  }
});
