import type {
  BooleanStateInput,
  ChannelStateInput,
  MCStateInput,
  MentionableStateInput,
  OptionStateInput,
  RoleStateInput,
  UserStateInput
} from '../Shared';
import type { MCComponentTypeOf } from './Common';
import {
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  ComponentType,
  MentionableSelectMenuInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction
} from 'discord.js';

const toComponentType = <T extends MCStateInput>(
  t: MCStateInput['type']
): MCComponentTypeOf<T> => {
  switch (t) {
    case 'Boolean':
      return ComponentType.Button as unknown as MCComponentTypeOf<T>;
    case 'Option':
      return ComponentType.StringSelect as unknown as MCComponentTypeOf<T>;
    case 'User':
      return ComponentType.UserSelect as unknown as MCComponentTypeOf<T>;
    case 'Channel':
      return ComponentType.ChannelSelect as unknown as MCComponentTypeOf<T>;
    case 'Role':
      return ComponentType.RoleSelect as unknown as MCComponentTypeOf<T>;
    case 'Mentionable':
      return ComponentType.MentionableSelect as unknown as MCComponentTypeOf<T>;
  }
};

type ToStateInput<T extends ComponentType> = T extends ComponentType.Button
  ? BooleanStateInput
  : T extends ComponentType.StringSelect
  ? OptionStateInput<any>
  : T extends ComponentType.UserSelect
  ? UserStateInput
  : T extends ComponentType.RoleSelect
  ? RoleStateInput
  : T extends ComponentType.MentionableSelect
  ? MentionableStateInput
  : T extends ComponentType.ChannelSelect
  ? ChannelStateInput
  : never;

type ToInteractionType<T extends ComponentType> = T extends ComponentType.Button
  ? ButtonInteraction
  : T extends ComponentType.StringSelect
  ? StringSelectMenuInteraction
  : T extends ComponentType.UserSelect
  ? UserSelectMenuInteraction
  : T extends ComponentType.RoleSelect
  ? RoleSelectMenuInteraction
  : T extends ComponentType.MentionableSelect
  ? MentionableSelectMenuInteraction
  : T extends ComponentType.ChannelSelect
  ? ChannelSelectMenuInteraction
  : never;

export { toComponentType };
export type { ToStateInput, ToInteractionType };
