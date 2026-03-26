import { z } from "zod";

export enum DatePartType {
  Day = "Day",
  Hour = "Hour",
  Minute = "Minute",
  Month = "Month",
  Weekday = "Weekday",
  Year = "Year",
}

export const datePartTypeSchema = z.enum(DatePartType);
