// One thing on an event calendar: when it starts, what it is called, and rich text saying more, shown on hover
export interface UiCalendarEvent {
  description?: string;
  id: string;
  start: Date;
  title: string;
}
