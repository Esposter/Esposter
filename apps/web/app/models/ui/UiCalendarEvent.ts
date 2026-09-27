// One thing on an event calendar: when it starts, what it is called, and rich text saying more, shown on hover
export interface UiCalendarEvent {
  description?: string;
  id: string;
  // Done with, as a completed task is: drawn struck through where it still falls
  isCompleted?: boolean;
  start: Date;
  title: string;
}
