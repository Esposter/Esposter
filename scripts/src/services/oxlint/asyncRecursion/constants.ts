export const MESSAGE =
  "An async function calling itself is a loop: each level holds a pending promise until the last one settles, and a list built as `[...page, ...(await next())]` is copied again on every level. Write the loop, and name its shape in a `no-await-in-loop` directive if it must stay sequential. See the runtime-efficiency skill's sequential-loops page.";
