import { DEVICE_ID_HEADER } from "#shared/models/realtime/DeviceId";
import { getDeviceId } from "@/services/realtime/getDeviceId";
import { checkIsServer } from "@esposter/shared";

// Every request names the tab that sent it, so a write reaches the server with the tab that made it. A server render
// sends for no tab, so it names none
export const getTrpcHeaders = (): Record<string, string> =>
  checkIsServer() ? {} : { [DEVICE_ID_HEADER]: getDeviceId() };
