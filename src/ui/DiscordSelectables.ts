import {
  BaseSelectMenuBuilder,
  ChannelSelectMenuBuilder,
  MentionableSelectMenuBuilder,
  RoleSelectMenuBuilder,
  UserSelectMenuBuilder,
  APISelectMenuComponent,
  APIUserSelectComponent,
  APIChannelSelectComponent,
  APIRoleSelectComponent,
  APIMentionableSelectComponent,
  SelectMenuType,
  UserSelectMenuComponent,
  RoleSelectMenuComponent,
  ChannelSelectMenuComponent,
  MentionableSelectMenuComponent,
  ComponentType
} from 'discord.js';
import { OptionStateInput, IOption, User, UserStateInput } from '../Shared';

type SelectableType = 'user' | 'role' | 'channel' | 'mentionable';
type DefaultVal<T extends SelectableType> = { id: string; type: T };
type ApiComponents =
  | APIUserSelectComponent
  | APIRoleSelectComponent
  | APIChannelSelectComponent
  | APIMentionableSelectComponent;
type ComponentFor<T extends SelectableType> = T extends 'user'
  ? APIUserSelectComponent
  : T extends 'role'
  ? APIRoleSelectComponent
  : T extends 'channel'
  ? APIChannelSelectComponent
  : T extends 'mentionable'
  ? APIMentionableSelectComponent
  : never;
type DefaultValueTypeFor<T extends ApiComponents> =
  T extends APIUserSelectComponent
    ? 'user'
    : T extends APIRoleSelectComponent
    ? 'role'
    : T extends APIChannelSelectComponent
    ? 'channel'
    : T extends APIMentionableSelectComponent
    ? 'mentionable'
    : never;
type DefaultValueFor<T extends ApiComponents> = DefaultVal<
  DefaultValueTypeFor<T>
>;

const toDf = <T extends SelectableType>(id: string, t: T): DefaultVal<T> => {
  return {
    id: id,
    type: t
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
type Builders =
  | UserSelectMenuBuilder
  | ChannelSelectMenuBuilder
  | RoleSelectMenuBuilder
  | MentionableSelectMenuBuilder;
class ExtendedBuilder<
  TType extends SelectableType
> extends BaseSelectMenuBuilder<ComponentFor<TType>> {
  private readonly idType: DefaultVal<TType>['type'];
  private _defaultValues: DefaultVal<TType>[] | undefined = undefined;

  private constructor(idType: DefaultVal<TType>['type']) {
    super({
      type: toComponentType(idType) as ComponentFor<TType>['type']
    } as Partial<ComponentFor<TType>>);
    this.idType = idType;
  }

  setDefaultValues = (dfs?: User[]) => {
    if (dfs) {
      this._defaultValues = dfs!.map((df) => toDf(df, this.idType));
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
  static forChannel(): ExtendedBuilder<'channel'> {
    return new ExtendedBuilder<'channel'>('channel');
  }
  static forMentionable(): ExtendedBuilder<'mentionable'> {
    return new ExtendedBuilder<'mentionable'>('mentionable');
  }
  static forRole(): ExtendedBuilder<'role'> {
    return new ExtendedBuilder<'role'>('role');
  }
}

const createUserSelect = (
  input: UserStateInput,
  currentValues?: User[]
): ExtendedBuilder<'user'> => {
  const eb = ExtendedBuilder.forUser();
  return createDiscordSelect(input, eb, currentValues);
};

const createDiscordSelect = <T extends SelectableType>(
  input: UserStateInput,
  eb: ExtendedBuilder<T>,
  currentValues?: User[]
): ExtendedBuilder<T> => {
  const dv = currentValues ?? input.value;
  const defaultValues: User[] = dv && Array.isArray(dv) ? (dv as User[]) : [];
  eb.setCustomId(input.id);
  eb.setDisabled(input.disabled);
  if (defaultValues.length > 0) {
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

export { createUserSelect, ExtendedBuilder };
