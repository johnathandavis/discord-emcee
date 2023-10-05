import './SymPolyfill';
import {
  InteractionCollector,
  ButtonInteraction,
  StringSelectMenuInteraction,
  ComponentType,
  InteractionResponse,
  UserSelectMenuInteraction
} from 'discord.js';
import {
  StateInput,
  StateValue,
  StateDefinition,
  InputUpdateArgs,
  InputUpdatedHandler,
  ValidationStateChangedArgs,
  UserStateInput
} from './Shared';
import evt from 'events';

type InternalCollector = InteractionCollector<
  ButtonInteraction | StringSelectMenuInteraction | UserSelectMenuInteraction
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
  } else if (si.type === 'User') {
    return undefined;
  } else if (si.type === 'Option') {
    return undefined;
  }
};

type ComponentTypeOf<T extends StateInput> = T['type'] extends 'Boolean'
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

function toComponentType<T extends StateInput>(
  t: StateInput['type']
): ComponentTypeOf<T> {
  switch (t) {
    case 'Boolean':
      return ComponentType.Button as unknown as ComponentTypeOf<T>;
    case 'Option':
      return ComponentType.StringSelect as unknown as ComponentTypeOf<T>;
    case 'User':
      return ComponentType.UserSelect as unknown as ComponentTypeOf<T>;
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
    let args: InputUpdateArgs<T> | undefined = undefined;
    if (i.componentType === ComponentType.Button) {
      const currentValue = k.value ?? false;
      const newValue = !currentValue;
      args = {
        item: k,
        oldValue: currentValue,
        newValue: newValue,
        interaction: i
      } as InputUpdateArgs<T>;
    } else if (i.componentType === ComponentType.StringSelect) {
      const currentValue = k.value ?? undefined;
      const selection = i.values[0] as unknown as T['value'];
      args = {
        item: k,
        oldValue: currentValue,
        newValue: selection as unknown as T['value'],
        interaction: i
      } as InputUpdateArgs<T>;
    } else if (i.componentType === ComponentType.UserSelect) {
      const usi = k as UserStateInput;
      const currentValue = usi.value ?? undefined;
      const selection = i.values ?? undefined;
      args = {
        item: k,
        oldValue: currentValue,
        newValue: selection as unknown as T['value'],
        interaction: i
      } as InputUpdateArgs<T>;
    }
    if (args) {
      await handler(args);
    }
  });
  return c;
}

interface EventArgsMap<T extends StateInput> {
  stateUpdate: InputUpdateArgs<T>;
  validationStateChanged: ValidationStateChangedArgs;
}
type HandlerMap<T extends StateInput> = {
  [Property in keyof EventArgsMap<T>]: (
    args: EventArgsMap<T>[Property]
  ) => void;
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

  on<T extends keyof HandlerMap<any>>(
    eventName: T,
    handler: HandlerMap<any>[T]
  ) {
    this._emitter.on(eventName, handler);
  }
  once<T extends keyof HandlerMap<any>>(
    eventName: T,
    handler: HandlerMap<any>[T]
  ) {
    this._emitter.once(eventName, handler);
  }
  off<T extends keyof HandlerMap<any>>(
    eventName: T,
    handler: HandlerMap<any>[T]
  ) {
    this._emitter.off(eventName, handler);
  }

  private onStateItemUpdated = async (args: InputUpdateArgs<any>) => {
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
