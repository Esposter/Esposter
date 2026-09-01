// Formatting a date in a component formats it twice — once in the server's locale and timezone, once in the
// Reader's — so the text mismatches on hydration and then shows the wrong clock. <NuxtTime> rewrites its own
// Text before Vue hydrates, so both renders agree. Components only: services and server code format freely,
// Which is why this list is spread into the `**/*.vue` override rather than into the shared script rules.
// The selectors match where a formatter is *built* as well as where it is called, because a formatter held in
// A variable (`const formatter = new Intl.DateTimeFormat(…); formatter.format(date)`) has no call site the
// Syntax can recognise. `formatDate` is named outright: it is the repo's own token formatter, so a component
// Reaching for it is asking for exactly the hand-written format string this rule exists to keep out. The
// Message-list labels built on it stay callable — that surface is client-rendered, and the standard says so.
// The standard is the doc; this list is the tripwire for the shapes people write.
export default [
  {
    message:
      "Don't format a date in a component. Use <NuxtTime :datetime> (add `relative` for a time-ago), which formats in the reader's locale and timezone without a hydration mismatch. See /docs/architecture/date-time-display.",
    selector:
      "CallExpression[callee.name=/^(useTimeAgo|useDateFormat)$/], CallExpression[callee.property.name=/^(fromNow|toNow|toLocaleDateString|toLocaleTimeString|toLocaleString)$/], CallExpression[callee.name='formatDate'], NewExpression[callee.object.name='Intl'][callee.property.name=/^(DateTimeFormat|RelativeTimeFormat)$/], CallExpression[callee.object.name='Intl'][callee.property.name=/^(DateTimeFormat|RelativeTimeFormat)$/]",
  },
];
