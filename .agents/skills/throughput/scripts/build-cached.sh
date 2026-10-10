#!/usr/bin/env bash
# Brings a workspace package and every workspace package it links up to date through the content-addressed build cache:
# a dist stamped with its key is left alone, a hit restores it, a miss builds it in a slot and stores it. Usage:
# bash .agents/skills/throughput/scripts/build-cached.sh <package directory>
set -euo pipefail
root="$(cd "$(dirname "$0")/../../../.." && pwd)"
packageDirectory="$(cd "$1" && pwd)"
# The cache tool loads configuration and shared from their dist, which a fresh worktree lacks, so those two are built
# Plainly once; the tool then restores or rebuilds them through the cache like any other package
for bootstrapPackage in configuration shared; do
  if [ ! -d "$root/packages/$bootstrapPackage/dist" ]; then
    (cd "$root/packages/$bootstrapPackage" && bash "$root/.agents/skills/throughput/scripts/run-in-slot.sh" pnpm exec tsdown --no-clean)
  fi
done
pnpm -s -C "$root/scripts" build:fresh "$packageDirectory"
