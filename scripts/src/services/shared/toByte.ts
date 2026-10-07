import { BYTE } from "#src/services/shared/constants";

// A share from 0 to 1 as a byte, a share outside it clamped to its nearer end
export const toByte = (share: number): number => Math.round(Math.min(Math.max(share, 0), 1) * BYTE);
