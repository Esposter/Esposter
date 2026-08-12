import { dayjs } from "#shared/services/dayjs";

export const ROOM_CATEGORY_DRAG_HANDLE_CLASS = "room-category-drag-handle";
// Touch drags wait so a swipe that starts on a category header scrolls the list instead of reordering it
export const ROOM_CATEGORY_TOUCH_DRAG_DELAY_MS = dayjs.duration(0.2, "seconds").asMilliseconds();
