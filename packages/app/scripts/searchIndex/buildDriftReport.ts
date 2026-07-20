import type { RoomDriftReport } from "@@/scripts/searchIndex/models/RoomDriftReport";

export const buildDriftReport = (
  tableCounts: Map<string, number>,
  indexCounts: Map<string, number>,
): RoomDriftReport[] => {
  const roomIds = new Set([...tableCounts.keys(), ...indexCounts.keys()]);
  const reports = Array.from(roomIds, (roomId) => {
    const tableCount = tableCounts.get(roomId) ?? 0;
    const indexCount = indexCounts.get(roomId) ?? 0;
    const drift = tableCount - indexCount;
    return { drift, indexCount, isDrifted: drift !== 0, roomId, tableCount };
  });
  return reports.toSorted((a, b) => Math.abs(b.drift) - Math.abs(a.drift) || a.roomId.localeCompare(b.roomId));
};
