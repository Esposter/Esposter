## 1. Volcanic ground

- [ ] 1.1 Draw lava as a bright flow on its authored channels, with its glow lighting the rock beside it. Verify: a test named after the scenario 'Lava lights the rock beside it at night', written first and seen failing.
      Blocked: the lava is two decal objects in the extraction's layout, `Area_Nt_Decal_Common_Lava_01_Vo` and `Eff_Stages_Gh_Lava_01_Vo`, both at the origin with no parent, with their meshes and material not exported, and no BigWorld stream or witness placement names either, so no channel has a position to draw on. It waits on the lava placement in the compute page's Open.
- [ ] 1.2 Send steam up from hot springs and vents. Verify: a test named after the scenario 'Steam rises from a hot spring'.
      Blocked: the steam is effect objects in the layout (`Eff_Stages_Steam_*`, `Steam_MPB`, `SteamInterval_01`), all at the origin and named by no stream or placement, so no hot spring or vent has a position to send steam from. It waits on the same placement as 1.1.
- [x] 1.3 Make an eruption area weather that suspends rain and lets it resume afterward. Verify: tests named after the scenarios 'An eruption stops the rain' and 'Rain resumes after an eruption'.

## 2. Tribes

- [ ] 2.1 Build the tribe-variant building kit's platforms, walls, roofs and murals, with each tribe's parameters and palette. Verify: a test named after the scenario 'Settlements of two tribes look different', and each tribe fitted against its own exports.
      Blocked: the extraction exports building meshes of two codes only, `Area_Nt_Build_YLL_*` (52) and `Area_Nt_Build_Common_*` (20), while the layout names buildings of fifteen codes, none exported, so one tribe at most has exports to fit against. It waits on the tribe-exports item in the compute page's Open.
- [ ] 2.2 Fit the Children of Echoes' canyon terraces and the other tribes' settlements, one tribe at a time. Verify: a test named after the scenario 'The Children of Echoes' lands are built in canyon terraces' passes.
      Blocked: waits on 2.1's exports, since no tribe's settlement is fitted yet.

## 3. Landmarks and palette

- [ ] 3.1 Build the Stadium of the Sacred Flame and Ochkanatlan to match their references. Verify: a test named after the scenario 'The Stadium of the Sacred Flame matches its reference'.
      Blocked: the Stadium's reference is captured outside the repository at `captures/natlan-stadium-sacred-flame.png`, not packed into `packages/genshin-world/parity/references/`, and has no `ParityReferenceMap` entry or landmark. The layout's one arena object, `Area_Nt_Build_JJC_POI_Arena_01_Group`, a candidate for the Stadium, and the arena meshes `maps/index.tsv` lists export no mesh, so nothing can be posed or built against it. It waits on the arena item in the compute page's Open.
- [ ] 3.2 Build Toyac Springs and the People of the Springs first, where the game enters Natlan, then apply the saturated palette to the ground, flowers and springs. Verify: a test named after the scenario 'Toyac Springs' pools read turquoise' passes.
      Blocked: Toyac Springs and the People of the Springs are already drawn, the `people-of-the-springs` landmark of `natlan.json` built by the Natlan kit. The palette waits on the ground, flower and spring families: `PaletteFamilyMap` samples the building field alone, and no exported surface is yet mapped to the pools, flowers or springs.
