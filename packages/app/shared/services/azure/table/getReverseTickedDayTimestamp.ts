import { AZURE_SELF_DESTRUCT_TIMER_SMALL } from "#shared/services/esbabbler/constants";

export const getReverseTickedDayTimestamp = (dayTimestamp: string) =>
  (BigInt(AZURE_SELF_DESTRUCT_TIMER_SMALL) - BigInt(dayTimestamp)).toString();
