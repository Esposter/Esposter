import type { DerivedAssetComponentOptions } from "#src/models/genshinAssets/DerivedAssetComponentOptions";

import { DerivedAssetComponent } from "#src/models/genshinAssets/DerivedAssetComponent";

// Each component's assets by the name the game gives them, which the asset index turns into the blocks holding them:
// The login screen's scene is every `LoginScene_` asset (its towers, walkway, bridges, pillars and door) and the
// Enviro sky its renderers draw with, named exactly since the sky package's names recur across the game: the sky
// Dome and the cloud layer's meshes, the cloud layer's and the three cloud emitters' materials, their particle
// Atlases and density maps, and the sky gradient every one of them is coloured by. Its roots are the arrangements the
// Login screen shows, of the several its blocks lay its meshes out in: the character select's stage, which holds its
// Towers, bridges, pillars and door at 0.4 scale (the door capture's door is that size), and the walkway, a root of its
// Own. The root `LoginScene_Build_All`, its `CG_opening01` groups and the full-scale door are the opening cinematic's.
// Its interface is `LoginMainPage`, in the block beside its `Ani_LoginMainPage_Waiting` clips
export const DerivedAssetComponentMap: Record<DerivedAssetComponent, DerivedAssetComponentOptions> = {
  [DerivedAssetComponent.Login]: {
    interface: { anchorPattern: "^Ani_LoginMainPage_Waiting", root: "LoginMainPage" },
    namePattern:
      "^(LoginScene_|Enviro_(Sky_Gradient|Clouds_(Middle_|Top_)?Particle_Atlas|Clouds_(Voronoi|Wispis|Normal)|Cloud_(Layer|Particle|Mid_Particle|Top_Particle)_Mat|Atmosphere_Layer_Mat)$|(Sky|Cloud)_LOD0$)",
    roots: ["CharacterSelectSceneNew", "LoginScene_Bridge01_Vo"],
  },
};
