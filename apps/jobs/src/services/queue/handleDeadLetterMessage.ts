import type { QueueJob } from "@esposter/db-schema";

import { MAX_DEAD_LETTER_ATTEMPTS } from "#src/services/queue/constants";
import { getJobQueue } from "#src/services/queue/getJobQueue";
import { quarantineDeadLetter } from "#src/services/queue/quarantineDeadLetter";
import { QueueJobMessageSchemaMap } from "#src/services/queue/QueueJobMessageSchemaMap";
import { DEAD_LETTER_CONSUMER_MAX_RETRIES } from "@esposter/db-schema";
import { getResult } from "@esposter/shared";

// One dead letter, handled alone. Its body is parsed by its job's schema first.
// A body that schema rejects can never succeed, so it is quarantined at once.
// A delivery that reaches the consumer's retry count is the last the queue makes, so it is quarantined.
// A body whose attempts are spent is quarantined too.
// Only the rest is republished to its source queue with its attempt raised.
// Resolving acknowledges the message, and a republish that throws retries it.
export const handleDeadLetterMessage = async (
  message: Message,
  job: QueueJob,
  sourceQueueName: string,
): Promise<void> => {
  const parsedBody = getResult(() => QueueJobMessageSchemaMap[job].parse(message.body));
  await parsedBody.match(
    async (body) => {
      if (message.attempts >= DEAD_LETTER_CONSUMER_MAX_RETRIES)
        await quarantineDeadLetter(
          message,
          sourceQueueName,
          `its deliveries reached ${DEAD_LETTER_CONSUMER_MAX_RETRIES}`,
        );
      else if (body.attempt >= MAX_DEAD_LETTER_ATTEMPTS)
        await quarantineDeadLetter(message, sourceQueueName, `its attempts reached ${MAX_DEAD_LETTER_ATTEMPTS}`);
      else await getJobQueue(job).send({ ...body, attempt: body.attempt + 1 });
    },
    (error) => quarantineDeadLetter(message, sourceQueueName, error),
  );
};
