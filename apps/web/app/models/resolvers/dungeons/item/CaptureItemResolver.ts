import type { Item } from "#shared/models/dungeons/item/Item";
import type { Monster } from "#shared/models/dungeons/monster/Monster";
import type { SceneWithPlugins } from "vue-phaserjs";

import { ItemEffectType } from "#shared/models/dungeons/item/ItemEffectType";
import { MONSTER_PARTY_MAX_LENGTH } from "#shared/services/dungeons/constants";
import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { AItemResolver } from "#src/models/resolvers/dungeons/AItemResolver";
import { CaptureItemFileKeyMap } from "#src/services/dungeons/item/CaptureItemFileKeyMap";
import { battleStateMachine } from "#src/services/dungeons/scene/battle/battleStateMachine";
import { phaserEventEmitter } from "#src/services/phaser/phaserEventEmitter";
import { useBallStore } from "#src/store/dungeons/battle/ball";
import { useInventoryInfoPanelStore } from "#src/store/dungeons/inventory/infoPanel";
import { useMonsterPartySceneStore } from "#src/store/dungeons/monsterParty/scene";
import { prettify } from "#src/util/text/prettify";
import { NotFoundError } from "@esposter/shared";

export class CaptureItemResolver extends AItemResolver {
  constructor() {
    super(ItemEffectType.Capture);
  }

  override checkIsActive(item: Ref<Item>, _monster: Ref<Monster>) {
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { monsters } = storeToRefs(monsterPartySceneStore);

    if (monsters.value.length >= MONSTER_PARTY_MAX_LENGTH) {
      const inventoryInfoPanelStore = useInventoryInfoPanelStore();
      const { infoDialogMessage } = storeToRefs(inventoryInfoPanelStore);
      infoDialogMessage.value.text = `You have no room in your party! Cannot use ${prettify(item.value.id)}.`;
      return false;
    }

    return true;
  }

  override handleItem(scene: SceneWithPlugins, item: Ref<Item>, monster: Ref<Monster>) {
    const fileKey = CaptureItemFileKeyMap[item.value.id];
    if (!fileKey) throw new NotFoundError(this.handleItem.name, item.value.id);

    const ballStore = useBallStore();
    const { texture } = storeToRefs(ballStore);
    texture.value = fileKey;
    phaserEventEmitter.emit("useItem", scene, item.value, monster.value, () =>
      battleStateMachine.setState(StateName.CatchMonster),
    );
  }
}
