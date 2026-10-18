// What a wait step waits for: the whole days that have to pass since the step began, and the hours of the day, from one
// To the next and across midnight when the first is later, that the clock has to read within
export interface QuestWait {
  days: number;
  fromHour: number;
  toHour: number;
}
