import { ComponentType, MessageComponentInteraction } from 'discord.js';
import { Attachers } from '../../src/state/CollectorAttachments';
import type {
  ComponentTypeMap,
  AttachableComponentTypes
} from '../../src/state/CollectorAttachments';
import { InputUpdateArgs, MCStateInput } from '../../src/Shared';

type AttachmentCall = {
  componentType: ComponentType;
  interaction: MessageComponentInteraction;
  stateInput: MCStateInput;
  args: InputUpdateArgs<MCStateInput>;
};
type FakeAttachers = ComponentTypeMap & {
  get attachmentCalls(): AttachmentCall[];
};

const createFakeAttachers = (): FakeAttachers => {
  let calls: AttachmentCall[] = [];
  const handler = {
    get(
      target: ComponentTypeMap,
      prop: string | number | Symbol,
      receiver: any
    ) {
      if (prop === 'attachmentCalls') return calls;
      const ct = prop as AttachableComponentTypes;
      const attacher = target[ct]!;
      return (interaction: MessageComponentInteraction, si: MCStateInput) => {
        const args = attacher(interaction as any, si as any);
        calls.push({
          componentType: ct,
          interaction: interaction,
          stateInput: si,
          args: args
        });
        return args;
      };
    }
  };
  return new Proxy<ComponentTypeMap>(Attachers, handler) as FakeAttachers;
};

export { createFakeAttachers };
export type { FakeAttachers };
