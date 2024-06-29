import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { Battle } from "@/models/dungeons/state/battle/states/Battle";
import { BringOutMonster } from "@/models/dungeons/state/battle/states/BringOutMonster";
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

export const StateMap = {
  [StateName.Intro]: Intro,
  [StateName.PreBattleInfo]: PreBattleInfo,
  [StateName.BringOutMonster]: BringOutMonster,
  [StateName.PlayerInput]: PlayerInput,
  [StateName.EnemyInput]: EnemyInput,
  [StateName.Battle]: Battle,
  [StateName.PlayerAttack]: PlayerAttack,
  [StateName.PlayerPostAttackCheck]: PlayerPostAttackCheck,
  [StateName.EnemyAttack]: EnemyAttack,
  [StateName.EnemyPostAttackCheck]: EnemyPostAttackCheck,
  [StateName.GainExperience]: GainExperience,
  [StateName.Finished]: Finished,
  [StateName.SwitchAttempt]: SwitchAttempt,
  [StateName.ItemAttempt]: ItemAttempt,
  [StateName.FleeAttempt]: FleeAttempt,
} as const satisfies Record<StateName, State<StateName>>;
