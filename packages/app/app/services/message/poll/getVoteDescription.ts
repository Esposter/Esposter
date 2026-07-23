import { pluralize } from "#shared/util/text/pluralize";

export const getVoteDescription = (count: number) => `${count} ${pluralize("vote", count)}`;
