## 1. Geography viewpoints

- [ ] 1.1 Place each viewpoint at the point its scene group record gives, provisional where the record leaves none. Verify: a test named after the scenario 'a reached viewpoint opens its entry when viewed', and a test named after the scenario 'a viewpoint is placed at the point its scene group record gives', seen failing first.
- [ ] 1.2 Offer a viewpoint for viewing only where its place is known. Partly built: `computeOfferedViewpoints` keeps the viewpoints whose codex ids the scene group record places. Nothing offers a viewpoint in the world yet, and the placed ids wait on 1.1. Verify: a test named after the scenario 'a viewpoint with no known place is not offered', seen failing first.

## 2. Living Beings

- [x] 2.1 Count each enemy defeat toward its Living Beings entry and open the entry on the first. Verify: tests named after the scenarios 'the first defeat opens an enemy's entry with a count of one' and 'a later defeat raises an enemy's count', seen failing first.

## 3. Tutorials

- [x] 3.1 Open a tutorial's entry when its tip is first shown, once a tip is shown by the world. Verify: a test named after the scenario 'a tutorial's entry opens when its tip is first shown', and a test named after the scenario 'a tutorial's entry stays as it was when its tip is shown again', seen failing first.

## 4. Progress

- [x] 4.1 Keep opened entries and defeat counts with the player's progress. Verify: a test named after the scenario 'opened entries and counts survive a reload', seen failing first.

## 5. Artifact sets

- [x] 5.1 Call `openArchiveArtifactSets` from the Archive's composable with the artifacts the bag holds, once the first artifact drop reaches the bag. Verify: a test named after the scenario 'Holding every piece opens the set', seen failing first.
