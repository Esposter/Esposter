// Weeks start on Monday, ISO 8601's first day, which is also Temporal's day one
export const getStartOfWeek = (date: Temporal.PlainDate) => date.subtract({ days: date.dayOfWeek - 1 });
