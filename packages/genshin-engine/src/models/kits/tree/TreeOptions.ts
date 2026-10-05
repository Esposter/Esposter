export interface TreeOptions {
  // How long a main branch is, in metres, before it forks
  branchLength: number;
  // Half a leaf card's side, in metres
  cardSize: number;
  // Leaf cards in each cluster
  cardsPerCluster: number;
  // How far a leaf cluster reaches from its centre, in metres
  clusterRadius: number;
  // Main branches spreading from the top of the trunk; each forks in two, and each fork carries a cluster
  mainBranchCount: number;
  seed: number;
  trunkHeight: number;
  trunkRadius: number;
}
