import type { CalendarOptions } from "@fullcalendar/vue3";

import dayGridPlugin from "@fullcalendar/vue3/daygrid";
import interactionPlugin from "@fullcalendar/vue3/interaction";
import monarchThemePlugin from "@fullcalendar/vue3/themes/monarch";
import timeGridPlugin from "@fullcalendar/vue3/timegrid";

// Kept apart from the other styled constants because the plugins are the whole calendar library, and a file
// Holding a tooltip string should not load it.
export const DEFAULT_CALENDAR_OPTIONS = {
  editable: true,
  footerToolbar: { right: "dayGridMonth,timeGridWeek,timeGridDay" },
  headerToolbar: { left: "title", right: "prevYear,prev,next,nextYear today" },
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, monarchThemePlugin],
} satisfies CalendarOptions;
