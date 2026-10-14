// What a slot of an event calendar's hours emits, shared by the views that show those hours
export interface UiCalendarSlotEmits {
  create: [start: Temporal.PlainDateTime];
  dragStart: [id: string];
  drop: [start: Temporal.PlainDateTime];
  nudge: [id: string, duration: Temporal.Duration];
  open: [id: string];
}
