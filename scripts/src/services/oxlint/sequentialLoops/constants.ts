export const ASYNC_SELF_CALL_MESSAGE =
  "An async function calling itself is a loop: each level holds a pending promise until the last one settles, and a list built as `[...page, ...(await next())]` is copied again on every level. Write the loop, and name its shape in a `no-await-in-loop` directive if it must stay sequential. See the runtime-efficiency skill's sequential-loops page.";
// The dependencies that keep a loop's awaits in sequence, the "Keep" table of the runtime-efficiency skill's
// Sequential-loops page. A directive's reason names one of these, so a new one is argued on that page first
export const SEQUENTIAL_LOOP_SHAPES: readonly string[] = [
  "Async iteration",
  "Bounded concurrency",
  "Committed prefix",
  "Each step reads the last",
  "Lock order",
  "One device",
  "Order is the contract",
  "Pagination",
  "Retry",
  "Stop at the first",
];
export const LOOP_SHAPE_MESSAGE = `A \`no-await-in-loop\` directive's reason opens with the dependency that keeps the loop sequential, as \`<shape>: <why here>\`, one per \`; \`-separated clause, the shape one of: ${SEQUENTIAL_LOOP_SHAPES.join(", ")}. Independent iterations are converted to \`Promise.all\` instead. See the runtime-efficiency skill's sequential-loops page.`;
// The rule a directive must name for its reason to be read here, by either linter's spelling
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const NO_AWAIT_IN_LOOP_REGEX: RegExp = /(?:^|[\s,/])no-await-in-loop(?:[\s,]|$)/u;
export const REASON_SEPARATOR = " -- ";
