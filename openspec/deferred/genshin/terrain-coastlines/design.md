# Coastlines in the ground fit

A coastline would be fitted after the ridges: the waterline traced where the game's ground crosses the region's water level, cut into segments, each a profile across the line raising the land on one side and lowering the bed on the other, its height fitted by least squares where the residual after the other features is largest.

**Why deferred:** Over Windrise, with its plateaus, cliffs and ridges placed to their stop, the samples near the waterline still hold about two fifths of the squared error left, but little of it is a step across the line. Every segment of the traced waterline fitted at once takes under a tenth of the error off, a free profile for each segment could take at most about a seventh, and only a dozen or so segments each take the 0.1% the stop asks of a feature, the margin a few more cliffs already reach. The shore's error is in the shape of the bed and the bank along the line, which no one profile across it holds, and the cliffs' terraces already take its sharpest drops. And only Windrise's world stream names a water level (`readWorldWaterLevel`), so no other region has a waterline to trace.

**Revisit when:** a region's world names its water level and its ground, fitted to the features' stop, leaves its largest error in a step across the waterline that a cliff's one-sided terrace cannot hold.
