import type { Item } from "@/models/dungeons/item/Item";
import type { Monster } from "@/models/dungeons/monster/Monster";
import type { SceneWithPlugins } from "vue-phaserjs";

import { ItemEffectType } from "@/models/dungeons/item/ItemEffectType";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { AItemResolver } from "@/models/resolvers/dungeons/AItemResolver";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { COLUMN_SIZE, ROW_SIZE } from "@/services/dungeons/scene/monsterParty/constants";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useBallStore } from "@/store/dungeons/battle/ball";
import { useInfoPanelStore } from "@/store/dungeons/inventory/infoPanel";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
import { prettify } from "@/util/text/prettify";
import { InvalidOperationError, Operation } from "@esposter/shared";

export class CaptureItemResolver extends AItemResolver {
  constructor() {
    super(ItemEffectType.Capture);
  }

  override handleItem(scene: SceneWithPlugins, item: Ref<Item>, monster: Ref<Monster>) {
    if (!item.value.fileKey) throw new InvalidOperationError(Operation.Read, this.handleItem.name, "FileKey");

    const ballStore = useBallStore();
    const { texture } = storeToRefs(ballStore);
    texture.value = item.value.fileKey;
    phaserEventEmitter.emit("useItem", scene, item.value, monster.value, () =>
      battleStateMachine.setState(StateName.CatchMonster),
    );
  }

  override isActive(item: Ref<Item>, _monster: Ref<Monster>) {
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { monsters } = storeToRefs(monsterPartySceneStore);

    if (monsters.value.length >= COLUMN_SIZE * ROW_SIZE) {
      const infoPanelStore = useInfoPanelStore();
      const { infoDialogMessage } = storeToRefs(infoPanelStore);
      infoDialogMessage.value.text = `You have no room in your party! Cannot use ${prettify(item.value.id)}.`;
      return false;
    }

    return true;
  }
}
