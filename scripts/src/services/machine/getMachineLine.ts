import { MachineState } from "#src/models/machine/MachineState";
import { REMINDER_MINUTES } from "#src/services/machine/constants";

// The one line the session is woken with, or none: a change of state always prints, while idle and tight repeat every
// Reminder interval they hold, and busy never reminds, since it has nothing to start
export const getMachineLine = (
  state: MachineState,
  lastState: MachineState | undefined,
  minutesInState: number,
  figures: string,
): string | undefined => {
  const isReminderDue = state !== MachineState.Busy && minutesInState > 0 && minutesInState % REMINDER_MINUTES === 0;
  if (state === lastState && !isReminderDue) return undefined;
  switch (state) {
    case MachineState.Busy:
      return lastState === undefined ? undefined : `machine busy: ${figures}`;
    case MachineState.Idle:
      return `machine idle: ${figures} - room for more runs`;
    case MachineState.Tight:
      return `machine tight: ${figures} - hold new runs`;
  }
};
