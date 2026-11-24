import type { ComponentReference } from "genshin-interface";

import { GameSourceKind, InvestigationOutcome } from "genshin-interface";

// The Traveler's model's motion in the game's data: the four locomotion clips the fit takes its motion from, and the
// Rig of PlayerGirl's model whose bone paths those clips name. Each topic lists what each investigation found and what
// Is still open, the way the locomotion reference does for the body's speeds
export const reference: ComponentReference = {
  sources: {
    playerGirlAvatar: {
      block: "00/02666572.blk",
      kind: GameSourceKind.Avatar,
      name: "Avatar_Girl_Sword_PlayerGirl_Model",
      role: "The rig the Traveler's clips bind, written beside the exports as avatar.json (`genshin:assets avatar playergirl`) and read for each bone's path",
    },
    travelerClips: {
      block: "00/04161624.blk, 00/04523043.blk",
      kind: GameSourceKind.AnimationClip,
      name: "Ani_Avatar_Girl_Standby, Ani_Avatar_Girl_WalkCycle, Ani_Avatar_Girl_RunCycle, Ani_Avatar_Girl_SprintCycle",
      role: "The Traveler's standing, walk, run and sprint cycles, the motion the fit is taken from",
    },
  },
  topics: {
    travelerClips: {
      investigations: [
        {
          method:
            "`pnpm -C scripts genshin:assets clips traveler`: the four clips the component's pattern names, exported from the blocks the asset index holds them in and printed with their seconds",
          outcome: InvestigationOutcome.Found,
          result:
            "Ani_Avatar_Girl_Standby 2 s in 00/04161624.blk, Ani_Avatar_Girl_WalkCycle 1.333 s, Ani_Avatar_Girl_RunCycle 0.667 s and Ani_Avatar_Girl_SprintCycle 0.467 s in 00/04523043.blk. 00/00035183.blk is in the index for the pattern and exports none on this install. Each clip holds 309 curves: 170 transform curves over 17 bones (each one's rotation, position and scale) and 139 humanoid-muscle curves on the animator, whose path is empty",
        },
        {
          method:
            "Each clip's binding paths matched against the bone paths of PlayerGirl's rig (`extracted/playergirl/avatar.json`): each bone's path the names from the rig's root down to it, hashed as CRC32 as the binding's path is",
          outcome: InvestigationOutcome.Found,
          result:
            "14 of the 17 bone paths name a bone of the rig: each arm from its clavicle through the upper arm, forearm, hand and fingers, the spine's chain under Bip001 Spine2 that they hang from, the upper-arm twists, the weapon bones WeaponL and WeaponR, the cloak bone +FlycloakRootB CB A01 and the pelvis twist +PelvisTwist CF A01. Three hashes (1720937360, 2627491571 and 3559852561) match no bone of that rig and print as their hashes. No leg bone is bound: the legs and the root move through the animator's muscle curves",
        },
        {
          method:
            "`clips traveler` before its curves were read as ACL-compressed: the streamed, dense and constant parts the decoder reads, all empty in these clips",
          outcome: InvestigationOutcome.Superseded,
          result:
            "Each clip is ACL-compressed (`m_ACLClip`, its curves in `m_ClipData` read with `m_DatabaseData`), so the decoder read no curve and every curve printed as held at zero. The decoder now leaves an ACL clip's curves undecoded, and the printout says so",
        },
        {
          method:
            "AnimeStudio's own clip export of the blocks with no `--export_type`, which writes the curves it decodes as Unity YAML",
          outcome: InvestigationOutcome.DeadEnd,
          result:
            "AnimeStudio's converter fails on each block: `ACLLibs.DBACL` throws its type initializer, since its native database library is not built on this Mac. Only `libAnimeStudio.ACL.MHY.dylib` is in the tool's folder, and it exports `DecompressClip` alone, with no streamer",
        },
      ],
      openQuestions: [
        "The clips' transform and muscle curves are not decoded on this Mac, so the fit has no sampled bone tracks to take, and its inputs wait on an ACL decode with the clip's database as streamer",
        "The three unnamed bone hashes: the rig they name is not PlayerGirl's, so the bones of the Traveler's own pack (their PMX names) may name them",
      ],
    },
  },
};
