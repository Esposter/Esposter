import { dayjs } from "#shared/services/dayjs";

// The message list's own clock format, which <NuxtTime> cannot express — Intl picks 12- or 24-hour by locale,
// And the gutter, the batch header and the Yesterday label all have to read the same. Safe to format here
// Because /messages is client-rendered (configuration/routeRules.ts), so there is no server clock to disagree with
export const getShortTimeLabel = (date: Date) => dayjs(date).format("H:mm");
