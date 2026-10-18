import type { DomainChallengeEnemy } from "#src/services/domains/domainChallengeLevels";

// The wave in play after a defeat: a wave holds until its last enemy falls, and then the next wave spawns, while the last
// Wave holds the challenge to its end
export const computeDomainWaveAfterDefeat = (
  waves: readonly (readonly DomainChallengeEnemy[])[],
  waveIndex: number,
  defeatsInWave: number,
): number => {
  const members = (waves[waveIndex] ?? []).reduce((total, { count }) => total + count, 0);
  if (defeatsInWave < members || waveIndex + 1 >= waves.length) return waveIndex;
  return waveIndex + 1;
};
