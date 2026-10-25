export const formatBand = (centre: number): string => (centre >= 1000 ? `${centre / 1000} kHz` : `${centre} Hz`);
