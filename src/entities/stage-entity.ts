import { merge } from "lodash";

import {
  Assets,
  StageEntity as BaseStageEntity,
} from "mu-engine";

import { PlayerEntity } from "./player-entity";
import { GridCameraSystem } from "../systems/grid-camera-system";
import { HudSystem } from "../systems/hud-system";
import { MapDisplaySystem } from "../systems/map-display-system";
import { generateDungeon, stageForDungeon } from "../modules/generate";

export interface StageEntityConfig {
  assets: Assets;
}

export class StageEntity extends BaseStageEntity {
  constructor(config: StageEntityConfig) {
    const dungeonConfig = {
      width: 8,
      height: 6,
      fill: 0.5,
      maxDepth: 8,
      gridWidth: 192,
      gridHeight: 128,
    };
    const dungeonData = generateDungeon(dungeonConfig);
    const stage = stageForDungeon(dungeonData, dungeonConfig);

    super(merge({ stage: stage }, config));

    this.render.fill = "#282828";

    const player = new PlayerEntity({
      position: JSON.parse(this.stage.prop("start")),
    });
    this.put(player);

    GridCameraSystem(this, player, {
      bounds: this.stage.bounds(),
      dimensions: { width: 192, height: 144 },
      delta: 750,
      hud: 16,
    });
    HudSystem(this);
    MapDisplaySystem(this, player, { dungeon: dungeonData });
  }
}
