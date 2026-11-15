import type { Topic } from "@esposter/db-schema";

import { TOPICS_HEADER_SEPARATOR } from "#shared/services/realtime/constants";

// One query's entry in the topics header: its procedure path, then the topics its answer read
export const formatTopicsHeaderValue = (path: string, topics: Topic[]): string =>
  [path, ...topics].join(TOPICS_HEADER_SEPARATOR);
