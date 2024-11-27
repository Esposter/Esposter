import type { TeleportTarget } from "@/shared/generated/tiled/propertyTypes/class/TeleportTarget";
import type { TeleportId } from "@/shared/generated/tiled/propertyTypes/enum/TeleportId";

export interface Teleport {
  id: TeleportId;
  target: TeleportTarget;
}
