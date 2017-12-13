import {
  StackEntity,
  RenderMediatorSystem,
  IntervalSystem,
  InputSystem,
} from "mu-engine";

import assets from "mu-assets-loader!../assets.config.json";
import { StageEntity } from "./entities/stage-entity";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("stage");

  if (canvas != null) {
    const stack = new StackEntity();
    stack.push(new StageEntity({
      assets: assets,
    }));

    InputSystem(stack, { canvas: canvas });
    IntervalSystem(stack, { fps: 30 });
    RenderMediatorSystem(stack, {
      canvas: canvas as HTMLCanvasElement,
      assets: assets,
      width: 192,
      height: 144,
      smoothing: false,
      scale: 2,
    });
  }
});
