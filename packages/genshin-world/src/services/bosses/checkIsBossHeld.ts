// Whether a boss defeated in an area is still held down: it is until a teleport lands outside that area after its defeat.
// Each teleport's landing is kept as the last one into its area, the landing outside every area under the empty id, so
// An entry for another area holding a landing after the defeat is a teleport out of this one
export const checkIsBossHeld = (
  areaId: string,
  defeatedAt: Temporal.Instant,
  lastTeleportAts: ReadonlyMap<string, Temporal.Instant>,
): boolean =>
  ![...lastTeleportAts].some(
    ([landedAreaId, landedAt]) => landedAreaId !== areaId && Temporal.Instant.compare(landedAt, defeatedAt) > 0,
  );
