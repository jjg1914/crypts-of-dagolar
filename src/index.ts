import {
  StackEntity,
  Stage,
  StageEntity,
  RenderMediatorSystem,
  IntervalSystem,
  InputSystem,
} from "mu-engine";

import assets from "mu-assets-loader!../assets.config.json";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("stage");

  if (canvas != null) {
    const stack = new StackEntity();

    const stage = new Stage(192, 144);
    stack.push(new StageEntity({
      assets: assets,
      stage: stage,
    }));

    InputSystem(stack, { canvas: canvas });
    IntervalSystem(stack, { fps: 60 });
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
