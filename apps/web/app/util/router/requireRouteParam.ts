import type { RouteParamName } from "@/models/router/RouteParamName";
import type { RouteParams } from "vue-router";

import { getRouteParam } from "@/util/router/getRouteParam";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The throwing half of `getRouteParam`: that one answers `""` for a segment the current route may legitimately not
// Have, this one is for a segment the page cannot exist without. Reaching it empty means the route matched
// Without the segment its own `validate` guard promised, which is a wiring bug rather than a bad url — so it
// Throws where a cast would have handed the empty string on to a query that fails at the server instead.
// Takes the params object and the key rather than the looked-up value, so the segment is named once instead
// Of being spelled into both the lookup and the message
export const requireRouteParam = (params: RouteParams, name: RouteParamName) => {
  const value = getRouteParam(params, name);
  if (!value) throw new InvalidOperationError(Operation.Read, requireRouteParam.name, `Missing route param: ${name}`);
  return value;
};
