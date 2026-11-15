export const GpuFigureLabel = { Darwin: "darwin", Win32: "win32" } as const;
export type GpuFigureLabel = (typeof GpuFigureLabel)[keyof typeof GpuFigureLabel];
