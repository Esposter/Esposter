# Order here is important!
# We must generate property types first which include important metadata enums
# e.g. TilemapKey which must exist before we generate other tilemap specific metadata.
# This causes a small issue if you try to run the generate scripts below in parallel
# as the typechecking will complain about the not-yet existent generated typescript enum files from generatePropertyTypes
Invoke-Expression "tsx scripts/tiled/remove.ts && tsx scripts/tiled/generatePropertyTypes.ts && tsx scripts/tiled/generateTmxProperties.ts"