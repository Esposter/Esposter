import { dayjs } from "#shared/services/dayjs";
import { AZURE_SELF_DESTRUCT_TIMER_SMALL } from "#shared/services/esbabbler/constants";

export const getReverseTickedDay = (createdAt: Date) =>
  (BigInt(AZURE_SELF_DESTRUCT_TIMER_SMALL) - BigInt(dayjs(createdAt).format("YYYYMMDD"))).toString();
