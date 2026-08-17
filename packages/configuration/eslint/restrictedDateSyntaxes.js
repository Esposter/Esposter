// Formatting a date in a component formats it twice — once in the server's locale and timezone, once in the
// Reader's — so the text mismatches on hydration and then shows the wrong clock. <NuxtTime> rewrites its own
// Text before Vue hydrates, so both renders agree. Components only: services and server code format freely,
// Which is why this list is spread into the `**/*.vue` override rather than into the shared script rules.
export default [
  {
    message:
      "Don't format a date in a component. Use <NuxtTime :datetime> (add `relative` for a time-ago), which formats in the reader's locale and timezone without a hydration mismatch. See /docs/architecture/date-time-display.",
    selector:
      "CallExpression[callee.name=/^(useTimeAgo|useDateFormat)$/], CallExpression[callee.property.name=/^(fromNow|toNow|toLocaleDateString|toLocaleTimeString|toLocaleString)$/], CallExpression[callee.object.callee.name='dayjs'][callee.property.name='format']",
  },
];
