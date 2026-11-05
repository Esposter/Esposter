# Genshin phases

## Why

The Genshin work advances on many fronts at once: render passes, screens, quests, systems and data each move in the order they became runnable on a machine, so no one can read how far the recreation is from the game. The program page names four phases, but only as an order of pages. No phase has a gate, no kind of work has a shared definition of done, and a progress reading is a count of unrelated checkboxes. This change turns the phases into gates a person can read, gives every kind of work a definition of done that a command can check, and makes the next piece of work the lowest one a machine can run.

## What Changes

The recreation's work is classed into ordered phases, each with an exit gate.

- Every roadmap item, open change and compute item belongs to exactly one phase, the lowest whose gate fails without it.
- Every kind of work (asset family, dataset, render pass, region, screen, system, quest) has a definition of done, checked by a command where one exists and named as a gap where it does not.
- The next piece of work any machine takes is the lowest phase's that the machine can run; documentation, specs and sweeps never wait.
- A report computes each phase's progress from the tree, so no page restates a count.

## Capabilities

- **genshin/phases** (new)

## Waiting on

None.

## Impact

The Genshin roadmap's structure, every Genshin change's metadata, the compute pages' item order, the fleet's pick of the next entry and the proposals report. It adds a progress report to the scripts package and a test that holds the classification.
