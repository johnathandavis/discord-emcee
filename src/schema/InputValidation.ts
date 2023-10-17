import type {
  MCRawShape,
  InputValidator,
  SchemaValidator,
  MCInputAny,
  ObjectOutput,
  ModalRawShape
} from './Core';

const optionalValidator = <TOut>(
  customValidator?: InputValidator<TOut>
): InputValidator<TOut> => {
  return (v: TOut) => {
    if (!customValidator) {
      return true;
    }
    return customValidator!(v);
  };
};
const requiredValidator = <TOut>(
  customValidator?: InputValidator<TOut>
): InputValidator<TOut> => {
  return (v: TOut) => {
    if (!customValidator) {
      return v ? true : false;
    }
    return customValidator!(v);
  };
};

type KeyShapePair = [key: string, shape: MCInputAny];
const buildDefaultSchemaValidator = <
  TShape extends MCRawShape | ModalRawShape,
  Output = ObjectOutput<TShape>
>(
  shape: TShape
): SchemaValidator<Output> => {
  const validators = Object.keys(shape)
    .map((k) => [k, shape[k]] as KeyShapePair) // MCInputType
    .map((pair) => {
      const [key, shape] = pair;
      const validator = (
        shape.validation.required
          ? requiredValidator(shape.validation.validate)
          : optionalValidator(shape.validation.validate)
      ) as InputValidator<any>;
      return (s: Output) => validator((s as { [key: string]: any })[key]);
    });
  return (s: Output) => {
    for (var i = 0; i < validators.length; i++) {
      const validator = validators[i];
      if (!validator(s)) return false;
    }
    return true;
  };
};

export type { InputValidator, SchemaValidator };
export { optionalValidator, requiredValidator, buildDefaultSchemaValidator };
