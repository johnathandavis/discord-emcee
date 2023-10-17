import {
  ButtonInteraction,
  ChannelSelectMenuInteraction,
  MentionableSelectMenuInteraction,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction
} from 'discord.js';
import {
  type IOption,
  type DiscordCoreSelectInput,
  type OptionStateInput,
  User,
  UserStateInput,
  Role,
  RoleStateInput,
  MentionableStateInput,
  Mentionable,
  Channel,
  ChannelStateInput,
  BooleanStateInput,
  StringStateInput
} from '../Shared';
import type {
  InteractionDeserializer,
  InteractionDeserializerMap
} from './Common';

function optionDeserializer<T>(
  state: OptionStateInput<T>,
  current: T,
  op: StringSelectMenuInteraction
): T {
  const optionMap = new Map<string, IOption<T>>();
  state.options.forEach((op) => {
    let id: string;
    if (op.value) id = op.value!;
    id = `${op.result}`;
    optionMap.set(id, op);
  });
  let selectedOptions = op.values
    ?.map((v) => optionMap.get(v)?.result)
    .filter((o) => o != undefined) as T;
  return selectedOptions;
}

type DiscordInteraction =
  | UserSelectMenuInteraction
  | ChannelSelectMenuInteraction
  | RoleSelectMenuInteraction
  | MentionableSelectMenuInteraction;
function discordDeserializer<TVal, TState extends DiscordCoreSelectInput<TVal>>(
  state: TState,
  op: DiscordInteraction
): TVal[] {
  let selectedOptions = op.values
    ?.map((v) => v as TVal)
    .filter((o) => o != undefined) as TVal[];
  return selectedOptions;
}

const boolDeserializer: InteractionDeserializer<BooleanStateInput> = (
  state: BooleanStateInput,
  current: boolean,
  op: ButtonInteraction
): boolean => {
  return !current;
};

const Deserializers: InteractionDeserializerMap = {
  Option: (s, c, op) => optionDeserializer(s, c, op),
  User: (s, c, op) => discordDeserializer<User, UserStateInput>(s, op),
  Channel: (s, c, op) => discordDeserializer<Channel, ChannelStateInput>(s, op),
  Role: (s, c, op) => discordDeserializer<Role, RoleStateInput>(s, op),
  Mentionable: (s, c, op) =>
    discordDeserializer<Mentionable, MentionableStateInput>(s, op),
  Boolean: boolDeserializer
};

export default Deserializers;
