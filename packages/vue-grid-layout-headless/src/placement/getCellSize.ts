// The size of a span of cells, a pitch per cell less the gap after the last one
export const getCellSize = (span: number, pitch: number, gap: number): number => span * pitch - gap;
