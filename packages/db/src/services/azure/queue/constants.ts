import { dayjs } from "@/services/dayjs";
// Azure Queue caps a message's visibility timeout (and its lifetime) at 7 days.
const maxQueueVisibilityTimeout = dayjs.duration(7, "days");
export const MAX_QUEUE_VISIBILITY_TIMEOUT_SECONDS = maxQueueVisibilityTimeout.asSeconds();
export const MAX_QUEUE_VISIBILITY_TIMEOUT_MS = maxQueueVisibilityTimeout.asMilliseconds();
