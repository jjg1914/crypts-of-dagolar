import {
  Entity,
  PositionData,
  InputEventData,
  RenderEventData,
  Bounds,
  shapeFor,
} from "mu-engine";

import { DungeonData } from "../modules/generate";

export interface MapDisplaySystemEntity extends Entity {
}

export interface TargetData {
  position: PositionData;
}

export interface MapDisplayConfig {
  dungeon: DungeonData;
}

export function MapDisplaySystem(entity: MapDisplaySystemEntity,
                                 target: TargetData,
                                 config: MapDisplayConfig)
: void {
  const buffer = document.createElement("canvas");
  const ctx = buffer.getContext("2d");

  const visited = new Array(config.dungeon.height);
  for (let i = 0; i < visited.length; ++i) {
    visited[i] = new Array(config.dungeon.width);
    visited[i].fill(false);
  }

  const bounds = {
    left: Infinity,
    right: -Infinity,
    top: Infinity,
    bottom: -Infinity,
  };

  for (let i = 0; i < config.dungeon.width; ++i) {
    for (let j = 0; j < config.dungeon.height; ++j) {
      if (config.dungeon.nodes[j][i].visited) {
        bounds.left = Math.min(i, bounds.left);
        bounds.right = Math.max(i, bounds.right);
        bounds.top = Math.min(j, bounds.top);
        bounds.bottom = Math.max(j, bounds.bottom);
      }
    }
  }

  let gridX = NaN;
  let gridY = NaN;

  if (ctx !== null) {
    buffer.width = (bounds.right - bounds.left + 1) * 8;
    buffer.height = (bounds.bottom - bounds.top + 1) * 8;
  }

  let show = false;

  entity.on("keydown", (ev: InputEventData) => {
    if (ev.which === "M") {
      show = true;
    }
  });

  entity.on("keyup", (ev: InputEventData) => {
    if (ev.which === "M") {
      show = false;
    }
  });

  entity.on("interval", () => {
    const targetBounds = shapeFor(target).bounds();
    const width = targetBounds.right - targetBounds.left;
    const height = targetBounds.bottom - targetBounds.top;
    const x = targetBounds.left + (width / 2);
    const y = targetBounds.top + (height / 2);

    const tmpX = Math.floor(x / config.dungeon.gridWidth);
    const tmpY = Math.floor(y / config.dungeon.gridHeight);
    visited[tmpY][tmpX] = true;

    if (ctx !== null && (tmpX !== gridX || tmpY !== gridY)) {
      gridX = tmpX;
      gridY = tmpY;
      _paintMap(ctx, config, visited, bounds, gridX, gridY);
    }
  });

  entity.after("prerender", (ev: RenderEventData) => {
    if (show) {
      const width = config.dungeon.width * 8;
      const height = config.dungeon.height * 8;
      const centerX = (ev.viewport.right - ev.viewport.left + 1) / 2;
      const centerY = (ev.viewport.bottom - ev.viewport.top + 1) / 2;

      ev.backend.add({
        x: ev.viewport.left + centerX - (width / 2),
        y: ev.viewport.top + centerY - (height / 2),
        width: width,
        height: height,
        render: { image: buffer, depth: 2 },
      });
    }
  });
}

function _paintMap(ctx: CanvasRenderingContext2D,
                   config: MapDisplayConfig,
                   visited: boolean[][],
                   bounds: Bounds,
                   gridX: number,
                   gridY: number)
: void {
  ctx.fillStyle = "#282828";
  ctx.fillRect(0, 0,
               (bounds.right - bounds.left + 1) * 8,
               (bounds.bottom - bounds.top + 1) * 8);

  for (let i = bounds.left; i <= bounds.right; ++i) {
    for (let j = bounds.top; j <= bounds.bottom; ++j) {
      const x = i - bounds.left;
      const y = j - bounds.top;

      if (config.dungeon.nodes[j][i].visited && visited[j][i]) {
        if (i === gridX && j === gridY){
          ctx.fillStyle = "#00b6e4";
        } else {
          ctx.fillStyle = "#FFF";
        }
        ctx.fillRect(x * 8 + 1, y * 8 + 1, 6, 6);

        if (config.dungeon.nodes[j][i].up) {
          ctx.fillRect(x * 8 + 3, y * 8, 2, 1);
        }

        if (config.dungeon.nodes[j][i].down) {
          ctx.fillRect(x * 8 + 3, y * 8 + 7, 2, 1);
        }

        if (config.dungeon.nodes[j][i].left) {
          ctx.fillRect(x * 8, y * 8 + 3, 1, 2);
        }

        if (config.dungeon.nodes[j][i].right) {
          ctx.fillRect(x * 8 + 7, y * 8 + 3, 1, 2);
        }
      }
    }
  }
}
