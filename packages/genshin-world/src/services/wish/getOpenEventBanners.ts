import type { WishScheduleEvent } from "#src/models/wish/WishScheduleEvent";

// The scheduled event banners whose window holds the server's time, from its start through its end, in the schedule's
// Order. Two character banners running alongside are both offered
export const getOpenEventBanners = (events: readonly WishScheduleEvent[], serverTime: number): WishScheduleEvent[] =>
  events.filter(({ endTime, startTime }) => startTime <= serverTime && serverTime <= endTime);
