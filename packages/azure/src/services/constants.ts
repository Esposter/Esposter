import { dayjs } from "#src/services/dayjs/index";

export const AZURE_MAX_BATCH_SIZE = 100;
export const AZURE_MAX_PAGE_SIZE = 1000;
// Azure Queue caps a message's visibility timeout (and its lifetime) at 7 days.
const maxQueueVisibilityTimeout = dayjs.duration(7, "days");
export const AZURE_MAX_QUEUE_VISIBILITY_TIMEOUT_MS: number = maxQueueVisibilityTimeout.asMilliseconds();
