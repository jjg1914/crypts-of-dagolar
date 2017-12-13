import {
  PositionData,
  IntervalEventData,
  RenderEventData,
  Entity,
  Bounds,
  Dimensions,
  shapeFor,
} from "mu-engine";

export interface CameraConfig {
  bounds: Bounds;
  dimensions: Dimensions;
  delta: number;
  hud: number;
}

export interface TargetData {
  position: PositionData;
}

export interface GridCameraSystemEntity extends Entity {
}

export function GridCameraSystem(entity: GridCameraSystemEntity,
                                 target: TargetData,
                                 config: CameraConfig): void {
  let cameraX = NaN;
  let cameraY = NaN;
  let cameraSrcX = NaN;
  let cameraSrcY = NaN;
  let cameraDestX = NaN;
  let cameraDestY = NaN;
  let tX = 0;
  let tY = 0;

  entity.on("interval", (ev: IntervalEventData) => {
    const targetBounds = shapeFor(target).bounds();
    const width = targetBounds.right - targetBounds.left;
    const height = targetBounds.bottom - targetBounds.top;
    const x = targetBounds.left + (width / 2);
    const y = targetBounds.top + (height / 2);

    const gridX = Math.floor(x / config.dimensions.width);
    const gridY = Math.floor(y / (config.dimensions.height - config.hud));

    cameraDestX = config.dimensions.width * gridX;
    cameraDestY = (config.dimensions.height - config.hud) * gridY;

    if (cameraDestX !== cameraX) {
      if (isNaN(cameraSrcX)) {
        cameraSrcX = cameraX;
      }

      if (!isNaN(cameraX)) {
        if (tX <= config.delta) {
          cameraX = (cameraDestX - cameraSrcX) * (tX / config.delta) + cameraSrcX;
          tX += ev.dt;
        } else {
          cameraX = cameraDestX;
          cameraSrcX = NaN;
          tX = 0;
        }
      } else {
        cameraX = cameraDestX;
        cameraSrcX = NaN;
      }
    }

    if (cameraDestY !== cameraY) {
      if (isNaN(cameraSrcY)) {
        cameraSrcY = cameraY;
      }

      if (!isNaN(cameraY)) {
        if (tY <= config.delta) {
          cameraY = (cameraDestY - cameraSrcY) * (tY / config.delta) + cameraSrcY;
          tY += ev.dt;
        } else {
          cameraY = cameraDestY;
          cameraSrcY = NaN;
          tY = 0;
        }
      } else {
        cameraY = cameraDestY;
        cameraSrcY = NaN;
      }
    }
  });

  entity.on("prerender", (ev: RenderEventData) => {
    ev.viewport.left = cameraX;
    ev.viewport.top = cameraY - config.hud;
    ev.viewport.right = cameraX + (config.dimensions.width) - 1;
    ev.viewport.bottom = cameraY + (config.dimensions.height) - 1;
  });
}
