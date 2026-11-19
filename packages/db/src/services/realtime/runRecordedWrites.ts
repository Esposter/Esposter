import type { TopicNamespace } from "#src/models/realtime/TopicNamespace";
import type { ColumnTopic } from "@esposter/db-schema";
import type { AsyncLocalStorage } from "node:async_hooks";

import { publishTopicsBestEffort } from "#src/services/realtime/publishTopicsBestEffort";
import { withFinalizerAsync } from "@esposter/shared";

// The one way a unit of work publishes the writes it records. `run` runs inside `scope`, the recording its handles write into,
// And once it settles, whether it succeeded or not, the topics `readTopics` names are published best-effort. A write that
// Landed before a failure still changed rows, so its topics go out either way
export const runRecordedWrites = <TScope, TId, TResult>(
  storage: AsyncLocalStorage<TScope>,
  scope: TScope,
  run: () => TResult,
  publish: {
    failure: string;
    readTopics: () => ColumnTopic[] | Promise<ColumnTopic[]>;
    topicNamespace: TopicNamespace<TId>;
  },
): Promise<Awaited<TResult>> =>
  withFinalizerAsync<Awaited<TResult>>(
    async (): Promise<Awaited<TResult>> => await storage.run(scope, run),
    () => publishTopicsBestEffort(publish.topicNamespace, publish.readTopics, publish.failure),
  );
