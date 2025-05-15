import type { IsDivider } from "@/models/shared/IsDivider";
import type { MenuItem } from "@/models/shared/MenuItem";

export const isDivider = (value: MenuItem): value is IsDivider => "isDivider" in value;
