import type { SendOptions } from "#src/models/room/SendOptions";
import type { RoomActor } from "@esposter/db-schema";

import { getDeviceSocketTag } from "@esposter/db-schema";

// A write from a device excludes that device's own socket, so the device that made it does not hear its echo
export const getSendOptions = ({ deviceId }: RoomActor): SendOptions =>
  deviceId === undefined ? {} : { excludeTag: getDeviceSocketTag(deviceId) };
