# Dates

Read when a field takes a date or a page shows events in time. That both are the library's is in `SKILL.md`; this page is how.

**A date is `UiDateField`, a span of days `UiDateRangeField`, and events in time `UiEventCalendar`**, both over `UiCalendar`'s plain days on the platform's Temporal — never Vuetify 0's date adapter, which bundles a second Temporal, and never the browser's own date input, which draws in the operating system's look. A range field's ends are plain days, and the call site decides which instant each means. An event calendar is handed its events as data and hands a drag or a double click back to the page; what it takes from Outlook and leaves out is `apps/web/content/docs/architecture/calendar.md`.
