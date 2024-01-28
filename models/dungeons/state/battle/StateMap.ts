import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { Battle } from "@/models/dungeons/state/battle/states/Battle";
import { BringOutMonster } from "@/models/dungeons/state/battle/states/BringOutMonster";
import { EnemyAttack } from "@/models/dungeons/state/battle/states/EnemyAttack";
import { EnemyInput } from "@/models/dungeons/state/battle/states/EnemyInput";
import { EnemyPostAttackCheck } from "@/models/dungeons/state/battle/states/EnemyPostAttackCheck";
import { Finished } from "@/models/dungeons/state/battle/states/Finished";
import { FleeAttempt } from "@/models/dungeons/state/battle/states/FleeAttempt";
import { Intro } from "@/models/dungeons/state/battle/states/Intro";
import { PlayerAttack } from "@/models/dungeons/state/battle/states/PlayerAttack";
import { PlayerInput } from "@/models/dungeons/state/battle/states/PlayerInput";
import { PlayerPostAttackCheck } from "@/models/dungeons/state/battle/states/PlayerPostAttackCheck";
import { PreBattleInfo } from "@/models/dungeons/state/battle/states/PreBattleInfo";

const StateRecord: Record<StateName, State<StateName>> = {
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
  [StateName.Finished]: Finished,
  [StateName.FleeAttempt]: FleeAttempt,
};

export const StateMap: Map<StateName, State<StateName>> = new Map(
  Object.entries(StateRecord) as [[StateName, State<StateName>]],
);
