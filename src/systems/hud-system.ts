import {
  RenderEventData,
  Entity,
} from "mu-engine";

export interface HudSystemEntity extends Entity {
}

export function HudSystem(entity: HudSystemEntity): void {
  entity.after("prerender", (ev: RenderEventData) => {
    ev.backend.add({
      x: ev.viewport.left,
      y: ev.viewport.top,
      width: ev.viewport.right - ev.viewport.left + 1,
      height: 16,
      render: { fill: "#282828", depth: 2 },
    })
  });
}
