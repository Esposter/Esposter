// The scripts print
// oxlint-disable no-restricted-properties -- this shape, with no date in it, and a mod cannot import the shared reviver
// A script's stdout as the record the script prints: a rejection when it is not JSON, which the caller settles
// JSON.parse
// oxlint-disable typescript/no-unsafe-type-assertion -- types its result as any, which the record's type replaces
// JSON.parse
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- checks no shape, so the caller names the record
export const parseScriptOutput = <T>(stdout: string): T => JSON.parse(stdout) as T;
// oxlint-enable typescript/no-unsafe-type-assertion
// oxlint-enable no-restricted-properties
