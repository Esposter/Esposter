// A program's file name in its shader's folder, by its index in the shader's programs
export const programName = (index: number): string => String(index).padStart(5, "0");
