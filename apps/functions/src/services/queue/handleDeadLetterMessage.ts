import type { QueueJob } from "@esposter/db-schema";

import { MAX_DEAD_LETTER_ATTEMPTS } from "#src/services/queue/constants";
import { getJobQueue } from "#src/services/queue/getJobQueue";
import { QueueJobMessageSchemaMap } from "#src/services/queue/QueueJobMessageSchemaMap";
import { quarantineDeadLetter } from "#src/services/queue/quarantineDeadLetter";
import { getResult } from "@esposter/shared";

// One dead letter, handled alone. Its body is parsed by its job's schema first: a body that schema rejects can never succeed,
// so it is quarantined at once. Otherwise it is republished to its source queue with its attempt raised, until its attempts are
// spent and it is quarantined. Resolving acknowledges the message; a republish that throws retries it
export const handleDeadLetterMessage = async (
  message: Message<unknown>,
  job: QueueJob,
  sourceQueueName: string,
): Promise<void> => {
  const parsedBody = getResult(() => QueueJobMessageSchemaMap[job].parse(message.body));
  await parsedBody.match(
    async (body) => {
      if (body.attempt >= MAX_DEAD_LETTER_ATTEMPTS) {
        await quarantineDeadLetter(message, sourceQueueName, `its attempts reached ${MAX_DEAD_LETTER_ATTEMPTS}`);
        return;
      }

      await getJobQueue(job).send({ ...body, attempt: body.attempt + 1 });
    },
    (error) => quarantineDeadLetter(message, sourceQueueName, error),
  );
};
