import { dayjs } from "#shared/services/dayjs";

export const getDisplayTime = (date: Date) => dayjs(date).format("h:mm A");
