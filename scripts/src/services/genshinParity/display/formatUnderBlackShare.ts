import type { computeUnderBlackShare } from "#src/services/genshinParity/display/computeUnderBlackShare";

const CHANNEL_NAMES = ["red", "green", "blue"] as const;
// A frame's share of pixels under the tone curve's black (`computeUnderBlackShare`), with each channel's own
export const formatUnderBlackShare = ({ channelShares, share }: ReturnType<typeof computeUnderBlackShare>): string =>
  `${(share * 100).toFixed(1)}% (${CHANNEL_NAMES.map((name, channel) => `${name} ${((channelShares[channel] ?? 0) * 100).toFixed(1)}%`).join(", ")})`;
