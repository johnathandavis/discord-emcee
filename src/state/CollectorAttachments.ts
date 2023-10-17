import {
  BooleanStateInput,
  Channel,
  ChannelStateInput,
  InputUpdateArgs,
  InputUpdatedHandler,
  MCStateInput,
  Mentionable,
  MentionableStateInput,
  OptionStateInput,
  Role,
  RoleStateInput,
  User,
  UserStateInput
} from 'Shared';
import {
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  ComponentType,
  InteractionResponse,
  MentionableSelectMenuInteraction,
  MessageComponentType,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction
} from 'discord.js';
import { InternalCollector } from './Common';
import * as utils from './Utils';
import type { ToStateInput, ToInteractionType } from './Utils';

type AttachableComponentTypes = Exclude<
  ComponentType,
  ComponentType.ActionRow | ComponentType.TextInput
>;
type AttacherOf<T extends AttachableComponentTypes> = (
  i: ToInteractionType<T>,
  k: ToStateInput<T>
) => InputUpdateArgs<ToStateInput<T>>;
type ComponentTypeMap = {
  [CT in AttachableComponentTypes]: AttacherOf<CT>;
};

const Attachers: ComponentTypeMap = {
  [ComponentType.Button]: (i: ButtonInteraction, k: BooleanStateInput) => {
    const currentValue = k.value ?? false;
    const newValue = !currentValue;
    return {
      item: k,
      oldValue: currentValue,
      newValue: newValue,
      interaction: i
    };
  },
  [ComponentType.StringSelect]: (
    i: StringSelectMenuInteraction,
    k: OptionStateInput<any>
  ) => {
    const currentValue = k.value ?? undefined;
    const selection = i.values[0];
    return {
      item: k,
      oldValue: currentValue,
      newValue: selection as any,
      interaction: i
    };
  },
  [ComponentType.UserSelect]: (
    i: UserSelectMenuInteraction,
    k: UserStateInput
  ) => {
    const currentValue = k.value ?? undefined;
    const selection = i.values ?? undefined;
    return {
      item: k,
      oldValue: currentValue,
      newValue: selection as unknown as User[],
      interaction: i
    };
  },
  [ComponentType.RoleSelect]: (
    i: RoleSelectMenuInteraction,
    k: RoleStateInput
  ) => {
    const currentValue = k.value ?? undefined;
    const selection = i.values ?? undefined;
    return {
      item: k,
      oldValue: currentValue,
      newValue: selection as Role[],
      interaction: i
    };
  },
  [ComponentType.MentionableSelect]: (
    i: MentionableSelectMenuInteraction,
    k: MentionableStateInput
  ) => {
    const users = i.users.map((u) => {
      return { id: u.id as User, type: 'user' } as Mentionable;
    });
    const roles = i.roles.map((r) => {
      return { id: r.id as Role, type: 'role' } as Mentionable;
    });
    const mentionables = users.concat(roles);
    const currentValue = k.value ?? undefined;
    const selection = mentionables ?? undefined;
    return {
      item: k,
      oldValue: currentValue,
      newValue: selection,
      interaction: i
    };
  },
  [ComponentType.ChannelSelect]: (
    i: ChannelSelectMenuInteraction,
    k: ChannelStateInput
  ) => {
    const currentValue = k.value ?? undefined;
    const selection = i.values ?? undefined;
    return {
      item: k,
      oldValue: currentValue,
      newValue: selection as Channel[],
      interaction: i
    };
  }
};

function createAttachment<T extends MCStateInput>(
  k: T,
  r: InteractionResponse,
  handler: InputUpdatedHandler<T>,
  customAttachers?: ComponentTypeMap
): InternalCollector {
  const attachers = customAttachers ?? Attachers;
  const c = r.createMessageComponentCollector<MessageComponentType>({
    componentType: utils.toComponentType(k.type),
    filter: (b) => b.customId === k.id
  }) as unknown as InternalCollector;
  c.on('collect', async (i) => {
    const attachFunc = attachers[i.componentType];
    if (!attachFunc) {
      console.error(`No attacher found for component type ${i.componentType}.`);
      return;
    }
    let args = attachFunc!(i as any, k as any) as InputUpdateArgs<T>;
    if (args) {
      await handler(args);
    }
  });
  return c;
}

export { createAttachment, Attachers };
export type { ComponentTypeMap, AttachableComponentTypes };
