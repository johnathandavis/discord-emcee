import './SymPolyfill';
import {
  InteractionCollector,
  ButtonInteraction,
  StringSelectMenuInteraction,
  ComponentType,
  InteractionResponse
} from 'discord.js';
import {
  StateInput,
  StateValue,
  StateDefinition,
  InputUpdateArgs,
  InputUpdatedHandler,
  ValidationStateChangedArgs
} from './Shared';
import evt from 'events';

type InternalCollector = InteractionCollector<
  ButtonInteraction | StringSelectMenuInteraction
>;
type InternalStateItem = {
  item: StateInput;
  value: StateValue;
  collector?: InternalCollector;
};
type InternalState = Record<string, InternalStateItem>;
type StateValueMap = Record<string, StateValue>;

const createInternalItem = (si: StateInput): InternalStateItem => {
  return {
    item: si,
    value: defaultValue(si)
  };
};

const defaultValue = (si: StateInput): StateValue => {
  if (si.value) return si.value;
  if (si.type === 'Boolean') {
    return false;
  } else if (si.type === 'Option') {
    return undefined;
  }
};

type ComponentTypeOf<T extends StateInput> = T['type'] extends 'Boolean'
  ? ComponentType.Button
  : T['type'] extends 'Options'
  ? ComponentType.StringSelect
  : never;

function toComponentType<T extends StateInput>(
  t: StateInput['type']
): ComponentTypeOf<T> {
  switch (t) {
    case 'Boolean':
      return ComponentType.Button as unknown as ComponentTypeOf<T>;
    case 'Option':
      return ComponentType.StringSelect as unknown as ComponentTypeOf<T>;
  }
}

function createAttachment<T extends StateInput>(
  k: T,
  r: InteractionResponse,
  handler: InputUpdatedHandler<T>
): InternalCollector {
  const c = r.createMessageComponentCollector<ComponentType.Button>({
    componentType: toComponentType(k.type),
    filter: (b) => b.customId === k.id
  }) as unknown as InternalCollector;
  c.on('collect', async (i) => {
    if (i.componentType === ComponentType.Button) {
      const currentValue = k.value ?? false;
      const newValue = !currentValue;
      await handler({
        item: k,
        oldValue: currentValue,
        newValue: newValue,
        interaction: i
      });
    } else if (i.componentType === ComponentType.StringSelect) {
      const currentValue = k.value ?? undefined;
      const selection = i.values[0] as unknown as T['value'];
      await handler({
        item: k,
        oldValue: currentValue,
        newValue: selection as unknown as T['value'],
        interaction: i
      });
    }
  });
  return c;
}

interface EventArgsMap {
  stateUpdate: InputUpdateArgs;
  validationStateChanged: ValidationStateChangedArgs;
}
type HandlerMap = {
  [Property in keyof EventArgsMap]: (args: EventArgsMap[Property]) => void;
};

class State {
  private readonly _definition: StateDefinition;
  private _state: InternalState;
  private _response: InteractionResponse | null = null;
  private _lastValidationResult: boolean = false;
  private readonly _emitter: evt.EventEmitter;
  private readonly _validator: (m: any) => boolean;

  constructor(def: StateDefinition, validator: (m: any) => boolean) {
    this._definition = def;
    this._state = {};
    this._emitter = new evt.EventEmitter();
    this._definition.inputs.forEach((si) => {
      this._state[si.id] = createInternalItem(si);
    });
    this._validator = validator;
  }

  get valueMap(): StateValueMap {
    const vm: StateValueMap = {};
    this._definition.inputs.forEach((si) => {
      vm[si.id] = this._state[si.id].value;
    });
    return vm;
  }

  monitorStateUpdates = (r: InteractionResponse) => {
    if (this._response) {
      throw new Error('Already monitoring state updates.');
    }
    this._response = r;
    this._definition.inputs.forEach((si) => {
      const internalItem = this._state[si.id];
      const collector = createAttachment(
        internalItem.item,
        r,
        this.onStateItemUpdated
      );
      internalItem.collector = collector;
    });
  };

  on<T extends keyof HandlerMap>(eventName: T, handler: HandlerMap[T]) {
    this._emitter.on(eventName, handler);
  }
  once<T extends keyof HandlerMap>(eventName: T, handler: HandlerMap[T]) {
    this._emitter.once(eventName, handler);
  }
  off<T extends keyof HandlerMap>(eventName: T, handler: HandlerMap[T]) {
    this._emitter.off(eventName, handler);
  }

  private onStateItemUpdated = async (args: InputUpdateArgs) => {
    this._state[args.item.id].value = args.newValue;
    const valid = this._validator(this.valueMap);
    console.log('Valid: ' + valid);
    this._emitter.emit('stateUpdate', args);
    if (valid != this._lastValidationResult) {
      this._emitter.emit('validationStateChanged', {
        isValid: valid
      });
    }
    this._lastValidationResult = valid;
  };

  [Symbol.dispose] = () => {
    this._emitter.removeAllListeners();
    if (!this._response) {
      console.debug(
        'Skipping state disposal since no InteractionResponse set...'
      );
      return;
    }
    console.debug('Disposing of state...');
    const collectors = Object.keys(this._definition)
      .map((k) => this._state[k])
      .map((si) => si.collector)
      .filter((c) => (c ? true : false)) as InteractionCollector<any>[];
    const interaction = this._response!.interaction;
    collectors.forEach((c) => {
      c.dispose(interaction);
    });
    console.debug('Disposed of state.');
  };
}

export type { InternalState, InternalStateItem };
export { State };
