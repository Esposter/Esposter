import type { TeleportTarget } from "@/generated/tiled/propertyTypes/class/TeleportTarget";
import type { TeleportId } from "@/generated/tiled/propertyTypes/enum/TeleportId";

export interface Teleport {
  id: TeleportId;
  target: TeleportTarget;
}
