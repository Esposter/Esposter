import { RecurrenceUnit } from "#shared/models/resource/todoList/RecurrenceUnit";

// Microsoft To Do's repeat presets, each a unit taken once
export const RecurrenceUnitLabelMap = {
  [RecurrenceUnit.Day]: "Daily",
  [RecurrenceUnit.Month]: "Monthly",
  [RecurrenceUnit.Week]: "Weekly",
  [RecurrenceUnit.Weekday]: "Weekdays",
  [RecurrenceUnit.Year]: "Yearly",
} as const satisfies Record<RecurrenceUnit, string>;
