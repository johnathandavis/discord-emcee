import type { MCStateInput, ModalStateInput } from '../Shared';

type RequiredKeys<T extends object> = {
  [k in keyof T]: undefined extends T[k] ? never : k;
}[keyof T];

export type Identity<T> = T;
export type Flatten<T> = Identity<{ [k in keyof T]: T[k] }>;
export type WithQuestionMarks<
  T extends object,
  R extends keyof T = RequiredKeys<T>
  // O extends keyof T = optionalKeys<T>
> = Flatten<Pick<Required<T>, R> & Partial<T>>;

type SchemaValidator<TOut> = (t: TOut) => boolean;
type InputValidationOptions<TOutput> = {
  required: boolean;
  validate?: InputValidator<TOutput>;
};
type InputValidator<TOutput> = (val: TOutput) => boolean;

class MCInputType<SI extends Omit<MCStateInput, 'id'>, Output = any> {
  readonly _output!: Output;
  private _validationOptions: InputValidationOptions<Output> = {
    required: true
  };

  constructor(readonly stateInput: SI) {}

  optional = (): this => {
    this._validationOptions = { ...this._validationOptions, required: false };
    return this;
  };

  validator = (v: InputValidator<Output>): this => {
    this._validationOptions = { ...this._validationOptions, validate: v };
    return this;
  };

  get validation(): InputValidationOptions<Output> {
    return this._validationOptions;
  }
}

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
class ModalInputType<
  SI extends Omit<ModalStateInput, 'id' | 'required'>,
  Output = any
> {
  readonly _output!: Output;
  _required: boolean = true;
  constructor(readonly stateInput: SI) {}

  optional = (): this => {
    this._required = false;
    return this;
  };
}

type MCInputAny = MCInputType<any>;
type RawShape<T> = {
  [k: string]: T;
};
type ModalRawShape = RawShape<ModalInputType<any>>;
type MCRawShape = RawShape<MCInputType<any>>;

/*
type ObjectOutput<Shape extends MCRawShape | ModalRawShape> =
  WithQuestionMarks<{
    [k in keyof Shape]: Shape[k]['_output'];
  }>;
*/

type ObjectOutput<Shape extends MCRawShape | ModalRawShape> = {
  [k in keyof Shape]: Shape[k]['_output'];
};

class MCType<T extends MCRawShape | ModalRawShape, Output = any> {
  readonly _output!: Output;
  readonly _shape: T;

  constructor(shape: T) {
    this._shape = shape;
  }
}

export type {
  InputValidator,
  InputValidationOptions,
  MCRawShape,
  ModalRawShape,
  MCInputAny,
  ObjectOutput,
  SchemaValidator
};
export { MCType, MCInputType, ModalInputType };
