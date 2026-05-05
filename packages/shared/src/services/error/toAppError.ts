export const toAppError = (error: unknown): Error => (error instanceof Error ? error : new Error(String(error)));
