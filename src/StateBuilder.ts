import {
  BooleanStateInput,
  StateDefinition,
  StateInput,
  OptionStateInput,
  UserStateInput,
  User
} from './Shared';

class MCType<T extends MCRawShape, Output = any> {
  readonly _output!: Output;
  readonly _shape: T;

  constructor(shape: T) {
    this._shape = shape;
  }
}
class MCInputType<SI extends Omit<StateInput, 'id'>, Output = any> {
  readonly _output!: Output;
  readonly _stateInput: SI;

  constructor(si: SI) {
    this._stateInput = si;
  }
}

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
class MCUser extends MCInputType<UserSI, boolean> {
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

type Infer<T extends MCType<any> | MCInputType<any>> = T['_output'];

type MCInputAny = MCInputType<any>;
type MCRawShape = {
  [k: string]: MCInputAny;
};

type ObjectOutput<Shape extends MCRawShape> = {
  [k in keyof Shape]: Shape[k]['_output'];
};
class MCSchema<T extends MCRawShape, Output = ObjectOutput<T>> extends MCType<
  T,
  Output
> {
  toStateDefinition(): StateDefinition {
    const inputs = Object.keys(this._shape).map((k) => {
      const input = this._shape[k];
      const si = input._stateInput;
      const siWithId: StateInput = {
        ...si,
        id: k
      };
      return siWithId;
    }) as StateInput[];
    return {
      inputs: inputs
    };
  }
}

function createSchema<T extends MCRawShape>(
  d: T
): MCSchema<T, ObjectOutput<T>> {
  return new MCSchema<T, ObjectOutput<T>>(d);
}

const s = createSchema({
  hi: boolInput({})
});

type SType = Infer<typeof s>;

export { createSchema, boolInput, optionInput, userInput };
export type { MCSchema, MCRawShape, Infer };
