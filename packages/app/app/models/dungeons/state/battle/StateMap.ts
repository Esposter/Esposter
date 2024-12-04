import type { State } from "@/models/dungeons/state/State";

import { StateName } from "@/models/dungeons/state/battle/StateName";
import { Battle } from "@/models/dungeons/state/battle/states/Battle";
import { BringOutMonster } from "@/models/dungeons/state/battle/states/BringOutMonster";
import { CatchMonster } from "@/models/dungeons/state/battle/states/CatchMonster";
import { EnemyAttack } from "@/models/dungeons/state/battle/states/EnemyAttack";
import { EnemyInput } from "@/models/dungeons/state/battle/states/EnemyInput";
import { EnemyPostAttackCheck } from "@/models/dungeons/state/battle/states/EnemyPostAttackCheck";
import { Finished } from "@/models/dungeons/state/battle/states/Finished";
import { FleeAttempt } from "@/models/dungeons/state/battle/states/FleeAttempt";
import { GainExperience } from "@/models/dungeons/state/battle/states/GainExperience";
import { Intro } from "@/models/dungeons/state/battle/states/Intro";
import { ItemAttempt } from "@/models/dungeons/state/battle/states/ItemAttempt";
import { PlayerAttack } from "@/models/dungeons/state/battle/states/PlayerAttack";
import { PlayerInput } from "@/models/dungeons/state/battle/states/PlayerInput";
import { PlayerPostAttackCheck } from "@/models/dungeons/state/battle/states/PlayerPostAttackCheck";
import { PreBattleInfo } from "@/models/dungeons/state/battle/states/PreBattleInfo";
import { SwitchAttempt } from "@/models/dungeons/state/battle/states/SwitchAttempt";
import { SwitchMonster } from "@/models/dungeons/state/battle/states/SwitchMonster";

export const StateMap = {
  [StateName.Battle]: Battle,
  [StateName.BringOutMonster]: BringOutMonster,
  [StateName.CatchMonster]: CatchMonster,
  [StateName.EnemyAttack]: EnemyAttack,
  [StateName.EnemyInput]: EnemyInput,
  [StateName.EnemyPostAttackCheck]: EnemyPostAttackCheck,
  [StateName.Finished]: Finished,
  [StateName.FleeAttempt]: FleeAttempt,
  [StateName.GainExperience]: GainExperience,
  [StateName.Intro]: Intro,
  [StateName.ItemAttempt]: ItemAttempt,
  [StateName.PlayerAttack]: PlayerAttack,
  [StateName.PlayerInput]: PlayerInput,
  [StateName.PlayerPostAttackCheck]: PlayerPostAttackCheck,
  [StateName.PreBattleInfo]: PreBattleInfo,
  [StateName.SwitchAttempt]: SwitchAttempt,
  [StateName.SwitchMonster]: SwitchMonster,
} as const satisfies Record<StateName, State<StateName>>;
