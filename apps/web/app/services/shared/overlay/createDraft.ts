import type { OverlayDraft } from "#src/models/shared/overlay/OverlayDraft";

export const createDraft = (): OverlayDraft => ({ handles: new Set(), touches: [] });
