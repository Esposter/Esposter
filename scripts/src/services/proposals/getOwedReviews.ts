import type { OwedReview } from "#src/models/proposals/OwedReview";
import type { ProductReviewPass } from "#src/models/proposals/ProductReviewPass";
import type { ProposalShip } from "#src/models/proposals/ProposalShip";

const getLatest = <T extends { timestamp: number }>(items: T[]): T | undefined =>
  items.reduce<T | undefined>(
    (latest, item) => (latest && latest.timestamp >= item.timestamp ? latest : item),
    undefined,
  );
// A ship moves the surface a pass last judged, so an area whose newest ship is newer than its newest pass is owed one
// (`product-review` skill, `references/convergence.md`). A ship and a pass in one commit are the pass itself deleting
// A superseded proposal, so it owes nothing; two commits in one second cannot be ordered, so they owe the pass.
export const getOwedReviews = (ships: ProposalShip[], passes: ProductReviewPass[]): OwedReview[] =>
  [...new Set(ships.map(({ area }) => area))].toSorted().flatMap((area) => {
    const lastShip = getLatest(ships.filter((ship) => ship.area === area));
    const lastPass = getLatest(passes.filter(({ areas }) => areas.includes(area)));
    if (!lastShip || (lastPass && (lastPass.hash === lastShip.hash || lastPass.timestamp > lastShip.timestamp)))
      return [];
    return [{ area, lastPassDate: lastPass?.date ?? "", lastShipDate: lastShip.date }];
  });
