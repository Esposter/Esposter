import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";

export const roundPair = ([x, y]: [number, number]): [number, number] => [roundFitted(x), roundFitted(y)];
