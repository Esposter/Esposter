import { dayjs } from "@/services/dayjs";

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, dayjs.duration(ms, "milliseconds").asMilliseconds()));
