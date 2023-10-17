import {
  BaseSelectMenuBuilder,
  APIUserSelectComponent,
  APIChannelSelectComponent,
  APIRoleSelectComponent,
  APIMentionableSelectComponent,
  ComponentType,
  ChannelType
} from 'discord.js';
import {
  User as UserId,
  Mentionable as MentionableId,
  UserStateInput,
  ChannelStateInput,
  Channel as ChannelId,
  RoleStateInput,
  MentionableStateInput,
  Role as RoleId
} from '../Shared';

type SelectableType = 'user' | 'role' | 'channel' | 'mentionable';

type DefaultValueTypeFor<T extends SelectableType> = T extends 'mentionable'
  ? undefined
  : T;
type DefaultVal<T extends SelectableType> = {
  id: string;
  type: DefaultValueTypeFor<T>;
};
type ComponentFor<T extends SelectableType> = T extends 'user'
  ? APIUserSelectComponent
  : T extends 'role'
  ? APIRoleSelectComponent
  : T extends 'channel'
  ? APIChannelSelectComponent
  : T extends 'mentionable'
  ? APIMentionableSelectComponent
  : never;
type StateInputFor<T extends SelectableType> = T extends 'user'
  ? UserStateInput
  : T extends 'channel'
  ? ChannelStateInput
  : T extends 'role'
  ? RoleStateInput
  : MentionableStateInput;

type DiscordDefaultTypeFor<T extends SelectableType> = T extends 'user'
  ? UserId
  : T extends 'channel'
  ? ChannelId
  : T extends 'role'
  ? RoleId
  : MentionableId;

const toDf = <T extends SelectableType>(
  id: DiscordDefaultTypeFor<T>,
  t: DefaultValueTypeFor<T>
): DefaultVal<T> => {
  if (typeof id === 'object') {
    const mentionId = id as MentionableId;
    return {
      id: mentionId.id,
      type: mentionId.type as DefaultValueTypeFor<T>
    };
  }
  return {
    id: id,
    type: t!
  };
};

const toComponentType = (t: SelectableType): ComponentType => {
  switch (t) {
    case 'channel':
      return ComponentType.ChannelSelect;
    case 'user':
      return ComponentType.UserSelect;
    case 'role':
      return ComponentType.RoleSelect;
    case 'mentionable':
      return ComponentType.MentionableSelect;
  }
};
type WithDefaultValues<T extends SelectableType> = ComponentFor<T> & {
  default_values?: DefaultVal<T>[];
};

class ExtendedBuilder<
  TType extends SelectableType,
  TVal extends StateInputFor<TType>['value'] = StateInputFor<TType>['value']
> extends BaseSelectMenuBuilder<ComponentFor<TType>> {
  private readonly idType: DefaultValueTypeFor<TType>;
  private _defaultValues: DefaultVal<TType>[] | undefined = undefined;

  constructor(idType: TType) {
    super({
      type: toComponentType(idType) as ComponentFor<TType>['type']
    } as Partial<ComponentFor<TType>>);
    if (idType !== 'mentionable') {
      this.idType = idType as DefaultValueTypeFor<TType>;
    } else {
      this.idType = undefined as DefaultValueTypeFor<TType>;
    }
  }

  setDefaultValues = (dfs?: TVal) => {
    if (dfs) {
      this._defaultValues = dfs!.map((df) =>
        toDf(df as DiscordDefaultTypeFor<TType>, this.idType)
      );
    } else {
      this._defaultValues = undefined;
    }
    return this;
  };

  toJSON = (): WithDefaultValues<TType> => {
    const sj: WithDefaultValues<TType> =
      super.toJSON() as unknown as WithDefaultValues<TType>;
    let superJson: WithDefaultValues<TType> = {
      ...sj
    };
    if (this._defaultValues) {
      superJson.default_values = this._defaultValues;
    }
    return superJson;
  };

  static forUser(): ExtendedBuilder<'user'> {
    return new ExtendedBuilder<'user'>('user');
  }
  static forChannel(): ExtendedChannelBuilder {
    return new ExtendedChannelBuilder();
  }
  static forMentionable(): ExtendedBuilder<'mentionable'> {
    return new ExtendedBuilder<'mentionable'>('mentionable');
  }
  static forRole(): ExtendedBuilder<'role'> {
    return new ExtendedBuilder<'role'>('role');
  }
}

class ExtendedChannelBuilder extends ExtendedBuilder<'channel'> {
  private _channelTypes: ChannelType[] | undefined = undefined;

  constructor() {
    super('channel');
  }

  setChannelTypes = (ct: ChannelType[]): ExtendedChannelBuilder => {
    this._channelTypes = ct;
    return this;
  };
  addChannelTypes = (ct: ChannelType[]): ExtendedChannelBuilder => {
    const current = this._channelTypes ?? [];
    current.push(...ct);
    this._channelTypes = current;
    return this;
  };

  toJSON = (): APIChannelSelectComponent => {
    let sj: APIChannelSelectComponent = super.toJSON();
    if (this._channelTypes) {
      sj.channel_types = this._channelTypes;
    }
    return sj;
  };
}

const createUserSelect = (
  input: UserStateInput,
  currentValues?: UserId[]
): ExtendedBuilder<'user'> => {
  const eb = ExtendedBuilder.forUser();
  return createDiscordSelect(input, eb, currentValues);
};

const createChannelSelect = (
  input: ChannelStateInput,
  currentValues?: ChannelId[]
): ExtendedChannelBuilder => {
  const cb = ExtendedBuilder.forChannel();
  createDiscordSelect(input, cb, currentValues);

  if (input.channelTypes) {
    cb.addChannelTypes(input.channelTypes);
  }
  return cb;
};

const createRoleSelect = (
  input: RoleStateInput,
  currentValues?: RoleId[]
): ExtendedBuilder<'role'> => {
  const eb = ExtendedBuilder.forRole();
  return createDiscordSelect(input, eb, currentValues);
};

const createMentionableSelect = (
  input: MentionableStateInput,
  currentValues?: MentionableId[]
): ExtendedBuilder<'mentionable'> => {
  const eb = ExtendedBuilder.forMentionable();
  return createDiscordSelect(input, eb, currentValues);
};

const createDiscordSelect = <
  T extends SelectableType,
  TVal extends StateInputFor<T>['value'] = StateInputFor<T>['value']
>(
  input: StateInputFor<T>,
  eb: ExtendedBuilder<T>,
  currentValues?: TVal
): ExtendedBuilder<T> => {
  const dv: TVal = currentValues! ?? input.value;
  const defaultValues: TVal =
    dv && Array.isArray(dv) ? (dv as TVal) : ([] as unknown as TVal);
  eb.setCustomId(input.id);
  if (input.disabled) {
    eb.setDisabled(input.disabled);
  }
  if (defaultValues!.length > 0) {
    eb.setDefaultValues(defaultValues);
  }
  if (input.maxValues) {
    eb.setMaxValues(input.maxValues);
  }
  if (input.minValues) {
    eb.setMinValues(input.minValues);
  }
  if (input.placeholder) {
    eb.setPlaceholder(input.placeholder);
  }
  return eb;
};

export {
  createUserSelect,
  createChannelSelect,
  createRoleSelect,
  createMentionableSelect,
  ExtendedBuilder,
  ExtendedChannelBuilder
};
