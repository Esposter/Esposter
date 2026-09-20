// What the machine knows of the person's moment without asking: the clock and the settings it already runs on
export interface Moment {
  hour: number;
  locale: string;
  timeZone: string;
  weekday: string;
}
