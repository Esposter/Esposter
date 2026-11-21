import type { ScheduledMessageJobWithRoom } from "#shared/models/db/message/scheduledMessageJob/ScheduledMessageJobWithRoom";
import type { Entry } from "#src/models/shared/overlay/Entry";

import { reminderTable, scheduledMessageTable } from "#src/services/message/scheduledMessageJob/constants";
import { getReminderRow } from "#src/services/message/scheduledMessageJob/getReminderRow";
import { getScheduledMessageRow } from "#src/services/message/scheduledMessageJob/getScheduledMessageRow";
import { ScheduledMessageJobType } from "@esposter/db-schema";

// The job's row as a tombstone, drawn at once: a cancel and a send both end the job the same way. It is built from the job
// The list holds, so it needs no row arrived first
export const getTombstoneEntry =
  (job: ScheduledMessageJobWithRoom, sessionUserId: string, deletedAt: Date): Entry =>
  (view) => {
    if (job.payload.type === ScheduledMessageJobType.Reminder) {
      view.set(reminderTable, [job.id], { ...getReminderRow(job, job.payload), deletedAt });
      return;
    }

    view.set(scheduledMessageTable, [job.id], {
      ...getScheduledMessageRow(job, job.payload, sessionUserId),
      deletedAt,
    });
  };
