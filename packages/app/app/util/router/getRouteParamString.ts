// A route param or query value is an array only for repeatable segments, so the first entry is the one
// Canonical value; vue-router models absent query values as null, hence the null in the accepted shape
export const getRouteParamString = (param: (null | string)[] | null | string | undefined): string =>
  (Array.isArray(param) ? param[0] : param) ?? "";
