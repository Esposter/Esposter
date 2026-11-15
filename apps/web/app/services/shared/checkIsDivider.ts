import type { IsDivider } from "#src/models/shared/IsDivider";
import type { MenuItem } from "#src/models/shared/MenuItem";

export const checkIsDivider = (value: MenuItem): value is IsDivider => "isDivider" in value;
