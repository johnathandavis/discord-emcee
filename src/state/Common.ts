import {
  InteractionCollector,
  ButtonInteraction,
  StringSelectMenuInteraction,
  ComponentType,
  UserSelectMenuInteraction
} from 'discord.js';
import type {
  InputUpdateArgs,
  ValidationStateChangedArgs,
  MCStateInput,
  MCInteractionOfInput
} from 'Shared';

type InternalCollector = InteractionCollector<
  ButtonInteraction | StringSelectMenuInteraction | UserSelectMenuInteraction
>;
type StateValue = MCStateInput['value'];
type InternalStateItem = {
  item: MCStateInput;
  value: StateValue;
  collector?: InternalCollector;
};
type InternalState = Record<string, InternalStateItem>;
type StateValueMap<T extends { [key: string]: any }> = {
  [Key in keyof T as string]: StateValue;
};

type MCComponentTypeOf<T extends MCStateInput> = T['type'] extends 'Boolean'
  ? ComponentType.Button
  : T['type'] extends 'Options'
  ? ComponentType.StringSelect
  : T['type'] extends 'User'
  ? ComponentType.UserSelect
  : T['type'] extends 'Channel'
  ? ComponentType.ChannelSelect
  : T['type'] extends 'Role'
  ? ComponentType.RoleSelect
  : T['type'] extends 'Mentionable'
  ? ComponentType.MentionableSelect
  : never;

type InteractionDeserializer<T extends MCStateInput> = (
  state: T,
  currentValue: Required<T>['value'],
  interaction: MCInteractionOfInput<T>
) => Required<T>['value'];
type InteractionDeserializerMap = {
  [SI in MCStateInput as SI['type']]: InteractionDeserializer<SI>;
};

interface EventArgsMap<T extends MCStateInput> {
  stateUpdate: InputUpdateArgs<T>;
  validationStateChanged: ValidationStateChangedArgs;
}
type HandlerMap<T extends MCStateInput> = {
  [Property in keyof EventArgsMap<T>]: (
    args: EventArgsMap<T>[Property]
  ) => void;
};

export type {
  StateValueMap,
  InternalCollector,
  InternalState,
  InternalStateItem,
  MCComponentTypeOf,
  InteractionDeserializer,
  InteractionDeserializerMap,
  HandlerMap
};
