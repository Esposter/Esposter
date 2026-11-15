// The properties a game parameter's curve drives that set how loud a node plays, by the id a bank's curve names
export const WwiseCurveParameter = { Volume: 0x00, BusVolume: 0x05, OutputBusVolume: 0x2b } as const;
export type WwiseCurveParameter = (typeof WwiseCurveParameter)[keyof typeof WwiseCurveParameter];
