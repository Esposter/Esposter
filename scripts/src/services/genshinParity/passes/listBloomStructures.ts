import type { GameBloomStructure } from "genshin-engine";

// Every structure of the bloom chain the ablation reads: the two prefilters, the two tap offsets, and each blur the
// Game's rotated pass and the engine's separable pair take once or twice a level. The first is the engine's own (the
// Default), read first so the ablation's default row reproduces the shipped reading
export const listBloomStructures = (): GameBloomStructure[] => {
  const blurs: Pick<GameBloomStructure, "blurForm" | "blurPasses">[] = [
    { blurForm: "separable", blurPasses: 1 },
    { blurForm: "rotated", blurPasses: 1 },
    { blurForm: "rotated", blurPasses: 2 },
    { blurForm: "separable", blurPasses: 2 },
  ];
  return (["oneTap", "fourTap"] as const).flatMap((prefilter) =>
    [0.5, 1].flatMap((tapOffset) => blurs.map((blur) => ({ ...blur, prefilter, tapOffset }))),
  );
};
