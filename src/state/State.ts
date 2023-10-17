import './SymPolyfill';
import { InteractionCollector, InteractionResponse } from 'discord.js';
import { MCStateInput, MCStateDefinition, InputUpdateArgs } from '../Shared';
import evt from 'events';
import type {
  InternalState,
  InternalStateItem,
  StateValueMap,
  HandlerMap
} from './Common';
import { MCRawShape } from 'schema';
import { createAttachment } from './CollectorAttachments';
import type { ComponentTypeMap } from './CollectorAttachments';

const createInternalItem = (si: MCStateInput): InternalStateItem => {
  return {
    item: si,
    value: defaultValue(si)
  };
};

const defaultValue = (si: MCStateInput): MCStateInput['value'] => {
  if (si.value) return si.value;
  if (si.type === 'Boolean') {
    return false;
  } else {
    return undefined;
  }
};

class State<TShape extends MCRawShape> {
  private readonly _definition: MCStateDefinition<TShape>;
  private readonly _attachers: ComponentTypeMap | undefined;
  private _state: InternalState;
  private _response: InteractionResponse | null = null;
  private _lastValidationResult: boolean = false;
  private readonly _emitter: evt.EventEmitter;
  private readonly _validator: (m: any) => boolean;

  constructor(def: MCStateDefinition<TShape>, attachers?: ComponentTypeMap) {
    this._definition = def;
    this._attachers = attachers;
    this._state = {};
    this._emitter = new evt.EventEmitter();
    this._definition.inputs.forEach((si) => {
      this._state[si.id] = createInternalItem(si);
    });
    this._validator = def.validator;
  }

  get valueMap(): StateValueMap<TShape> {
    const vm: Partial<StateValueMap<TShape>> = {};
    this._definition.inputs.forEach((si) => {
      (vm as any)[si.id] = this._state[si.id].value;
    });
    return vm as unknown as StateValueMap<TShape>;
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
        this.onStateItemUpdated,
        this._attachers
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
