// Formatting a date in a component formats it twice — once in the server's locale and timezone, once in the
// Reader's — so the text mismatches on hydration and then shows the wrong clock. <NuxtTime> rewrites its own
// Text before Vue hydrates, so both renders agree. Components only: services and server code format freely,
// Which is why this list is spread into the `**/*.vue` override rather than into the shared script rules.
// The selectors match where a formatter is *built* as well as where it is called, because a formatter held in
// A variable (`const formatter = new Intl.DateTimeFormat(…); formatter.format(date)`) has no call site the
// Syntax can recognise. A dayjs instance parked in a variable and formatted later is the one shape left
// Uncovered — esquery cannot follow the binding, and a bare `.format()` selector would take
// `Intl.NumberFormat` with it. The standard is the doc; this list is the tripwire for the shapes people write.
export default [
  {
    message:
      "Don't format a date in a component. Use <NuxtTime :datetime> (add `relative` for a time-ago), which formats in the reader's locale and timezone without a hydration mismatch. See /docs/architecture/date-time-display.",
    selector:
      "CallExpression[callee.name=/^(useTimeAgo|useDateFormat)$/], CallExpression[callee.property.name=/^(fromNow|toNow|toLocaleDateString|toLocaleTimeString|toLocaleString)$/], CallExpression[callee.object.callee.name='dayjs'][callee.property.name='format'], CallExpression[callee.object.callee.object.callee.name='dayjs'][callee.property.name='format'], NewExpression[callee.object.name='Intl'][callee.property.name=/^(DateTimeFormat|RelativeTimeFormat)$/], CallExpression[callee.object.name='Intl'][callee.property.name=/^(DateTimeFormat|RelativeTimeFormat)$/]",
  },
];
