import type { RouteParamName } from "@/models/router/RouteParamName";
import type { RouteParams } from "vue-router";

import { getRouteParamString } from "@/util/router/getRouteParamString";

// The params of a route read without naming it are the union of every page's, so a reader that serves more than one
// Route asks for the segment by name, and a route without it answers `""`
export const getRouteParam = (params: RouteParams, name: RouteParamName) => {
  const paramMap: Partial<Record<RouteParamName, string | string[] | undefined>> = params;
  return getRouteParamString(paramMap[name]);
};
