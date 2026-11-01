import type { InterfaceClipProperty } from "#src/models/InterfaceClipProperty";

import { InterfaceClipProperties } from "#src/models/InterfaceClipProperty";

// Widened to strings, so a property a fit wrote can be looked up in it
const INTERFACE_CLIP_PROPERTY_NAMES: readonly string[] = InterfaceClipProperties;
export const checkIsProperty = (property: string): property is InterfaceClipProperty =>
  INTERFACE_CLIP_PROPERTY_NAMES.includes(property);
