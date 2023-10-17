import {
  BooleanStateInput,
  MCStateDefinition,
  MCStateInput,
  OptionStateInput,
  UserStateInput,
  User,
  ChannelStateInput,
  Channel,
  RoleStateInput,
  MentionableStateInput,
  Mentionable,
  Role,
  StringStateInput,
  ModalStateDefinition,
  ModalStateInput
} from '../Shared';
import {
  MCType,
  MCInputType,
  MCRawShape,
  ModalRawShape,
  ModalInputType,
  ObjectOutput
} from './Core';
import type { SchemaValidator } from './InputValidation';
import { buildDefaultSchemaValidator } from './InputValidation';

type BoolSI = Omit<BooleanStateInput, 'id'>;
type BooleanCreateOptions = Omit<BoolSI, 'type'>;
class MCBoolean extends MCInputType<BoolSI, boolean> {
  constructor(createOptions: BooleanCreateOptions) {
    super({
      ...createOptions,
      type: 'Boolean'
    });
  }
}
function boolInput(options: BooleanCreateOptions): MCBoolean {
  return new MCBoolean(options);
}

type OptionSI<TOption> = Omit<OptionStateInput<TOption>, 'id'>;
type OptionCreateOptions<TOption> = Omit<OptionSI<TOption>, 'type'>;
class MCOption<TOption> extends MCInputType<OptionSI<TOption>, TOption> {
  constructor(createOptions: OptionCreateOptions<TOption>) {
    super({
      ...createOptions,
      type: 'Option'
    });
  }
}
function optionInput<TOption>(
  options: OptionCreateOptions<TOption>
): MCOption<TOption> {
  return new MCOption(options);
}

type UserSI = Omit<UserStateInput, 'id'>;
type UserCreateOptions = Omit<UserSI, 'type'>;
class MCUser extends MCInputType<UserSI, User> {
  constructor(createOptions: UserCreateOptions) {
    super({
      ...createOptions,
      type: 'User'
    });
  }
}
function userInput(options: UserCreateOptions): MCUser {
  return new MCUser(options);
}

type ChannelSI = Omit<ChannelStateInput, 'id'>;
type ChannelCreateOptions = Omit<ChannelSI, 'type'>;
class MCChannel extends MCInputType<ChannelSI, Channel> {
  constructor(createOptions: ChannelCreateOptions) {
    super({
      ...createOptions,
      type: 'Channel'
    });
  }
}
function channelInput(options: ChannelCreateOptions): MCChannel {
  return new MCChannel(options);
}

type RoleSI = Omit<RoleStateInput, 'id'>;
type RoleCreateOptions = Omit<RoleSI, 'type'>;
class MCRole extends MCInputType<RoleSI, Role> {
  constructor(createOptions: RoleCreateOptions) {
    super({
      ...createOptions,
      type: 'Role'
    });
  }
}
function roleInput(options: RoleCreateOptions): MCRole {
  return new MCRole(options);
}

type MentionableSI = Omit<MentionableStateInput, 'id'>;
type MentionableCreateOptions = Omit<MentionableSI, 'type'>;
class MCMentionable extends MCInputType<MentionableSI, Mentionable> {
  constructor(createOptions: MentionableCreateOptions) {
    super({
      ...createOptions,
      type: 'Mentionable'
    });
  }
}

function mentionableInput(options: MentionableCreateOptions): MCMentionable {
  return new MCMentionable(options);
}

type StringSI = Omit<StringStateInput, 'id'>;
type StringCreateOptions = Omit<StringSI, 'type' | 'required'>;
class ModalString extends ModalInputType<StringSI, string> {
  constructor(createOptions: StringCreateOptions) {
    super({
      ...createOptions,
      type: 'String'
    });
  }
}
function stringInput(options: StringCreateOptions): ModalString {
  return new ModalString(options);
}

type Infer<T extends Schema<any, any, any> | MCInputType<any>> = T['_output'];

abstract class Schema<
  RootShape extends MCRawShape | ModalRawShape,
  TShape extends RootShape,
  TStateDefinition,
  Output = ObjectOutput<TShape>
> extends MCType<TShape, Output> {
  abstract toStateDefinition(): TStateDefinition;
}

class MCSchema<TShape extends MCRawShape> extends Schema<
  TShape,
  TShape,
  MCStateDefinition<MCRawShape>
> {
  private _validator: SchemaValidator<ObjectOutput<TShape>> | undefined =
    undefined;

  toStateDefinition = (): MCStateDefinition<MCRawShape> => {
    const inputs = Object.keys(this._shape).map((k) => {
      const input = this._shape[k];
      const si = input.stateInput;
      const siWithId: MCStateInput = {
        ...si,
        id: k
      };
      return siWithId;
    }) as MCStateInput[];
    const validator = this._validator
      ? this._validator
      : buildDefaultSchemaValidator<MCRawShape, ObjectOutput<MCRawShape>>(
          this._shape
        );
    return {
      inputs: inputs,
      validator: validator
    } as MCStateDefinition<MCRawShape>;
  };

  validator = (validator: SchemaValidator<ObjectOutput<TShape>>): this => {
    this._validator = validator;
    return this;
  };
}
class ModalSchema<TShape extends ModalRawShape> extends Schema<
  TShape,
  TShape,
  ModalStateDefinition<ModalRawShape>
> {
  toStateDefinition = (): ModalStateDefinition<ModalRawShape> => {
    const inputs = Object.keys(this._shape).map((k) => {
      const input = this._shape[k];
      const si = input.stateInput;
      const siWithId: ModalStateInput = {
        ...si,
        id: k
      };
      if ('_required' in si) {
        siWithId['required'] = si._required;
      }
      return siWithId;
    }) as ModalStateInput[];
    return {
      inputs: inputs
    } as ModalStateDefinition<ModalRawShape>;
  };
}

function createMCSchema<T extends MCRawShape>(d: T): MCSchema<T> {
  return new MCSchema<T>(d);
}
function createModalSchema<T extends ModalRawShape>(d: T): ModalSchema<T> {
  return new ModalSchema<T>(d);
}

export {
  createMCSchema,
  createModalSchema,
  boolInput,
  optionInput,
  userInput,
  roleInput,
  stringInput,
  channelInput,
  mentionableInput
};
export type {
  MCSchema,
  ModalSchema,
  MCRawShape,
  ModalRawShape,
  MCBoolean,
  MCOption,
  Infer
};
