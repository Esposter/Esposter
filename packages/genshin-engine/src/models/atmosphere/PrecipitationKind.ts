// The particles a weather falls: rain's streaks, snow's flakes and the sand a sandstorm carries on the wind
export const PrecipitationKind = { Rain: "Rain", Sand: "Sand", Snow: "Snow" } as const;
export type PrecipitationKind = (typeof PrecipitationKind)[keyof typeof PrecipitationKind];
