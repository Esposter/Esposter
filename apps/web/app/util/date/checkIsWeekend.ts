// Temporal numbers a week's days from Monday, one, to Sunday, seven, so a weekend is the last two of them
const SATURDAY = 6;
const SUNDAY = 7;

export const checkIsWeekend = (day: Temporal.PlainDate) => day.dayOfWeek === SATURDAY || day.dayOfWeek === SUNDAY;
