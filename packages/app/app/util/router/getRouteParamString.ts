// A route param is a string array only for repeatable segments, so the first entry is the one canonical value
export const getRouteParamString = (param: string | string[] | undefined): string =>
  (Array.isArray(param) ? param[0] : param) ?? "";
