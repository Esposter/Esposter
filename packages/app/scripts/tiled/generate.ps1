# Order here is important!
# We must generate property types first which include important metadata enums
# e.g. TilemapKey which must exist before we generate other tilemap specific metadata.
# This causes a small issue if you try to run the generate scripts below in parallel
# as the typechecking will complain about the not-yet existent generated typescript enum files from generatePropertyTypes
Invoke-Expression "bun --bun scripts/tiled/remove.ts && bun --bun scripts/tiled/generatePropertyTypes.ts && bun --bun scripts/tiled/generateTmxProperties.ts"