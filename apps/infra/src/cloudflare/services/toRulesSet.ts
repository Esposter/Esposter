// A set in the rules language: each value quoted and space-separated, as `http.host in {...}` reads it
export const toRulesSet = (values: string[]): string => `{${values.map((value) => `"${value}"`).join(" ")}}`;
