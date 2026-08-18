import { EN_US_CONJUNCTION_FORMATTER } from "#shared/services/intl/constants";
import { MAX_REACTION_HOVER_NAMES } from "@/services/message/emoji/constants";

// "Alice, Bob and 4 others" — the same shape Discord's hover card uses, so the line stays readable at any
// Count. The overflow entry is itself a list member rather than a suffix, which is what lets `Intl` place the
// Conjunction: appending " and N others" by hand would produce "Alice and Bob and 4 others"
export const getReactorNames = (userIds: string[], getMemberName: (userId: string) => string) => {
  const names = userIds.slice(0, MAX_REACTION_HOVER_NAMES).map((userId) => getMemberName(userId));
  const overflow = userIds.length - names.length;
  return EN_US_CONJUNCTION_FORMATTER.format(
    overflow > 0 ? [...names, `${overflow} other${overflow > 1 ? "s" : ""}`] : names,
  );
};
