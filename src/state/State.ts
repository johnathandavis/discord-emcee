import './SymPolyfill';
import {
  InteractionCollector,
  ComponentType,
  InteractionResponse,
  UserSelectMenuInteraction,
  MessageComponentType,
  RoleSelectMenuInteraction,
  ChannelSelectMenuInteraction,
  MentionableSelectMenuInteraction
} from 'discord.js';
import {
  MCStateInput,
  MCStateDefinition,
  InputUpdateArgs,
  InputUpdatedHandler,
  UserStateInput,
  MCInteractionOfInput,
  RoleStateInput,
  ChannelStateInput,
  Mentionable,
  User,
  Role
} from '../Shared';
import evt from 'events';
import type {
  InternalState,
  InternalStateItem,
  InternalCollector,
  StateValueMap,
  HandlerMap,
  InteractionDeserializer
} from './Common';
import Deserializers from './Deserialization';
import * as utils from './Utils';
import { MCRawShape } from 'schema';
import { ObjectOutput } from 'schema/Core';

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

function createAttachment<T extends MCStateInput>(
  k: T,
  r: InteractionResponse,
  handler: InputUpdatedHandler<T>
): InternalCollector {
  const c = r.createMessageComponentCollector<MessageComponentType>({
    componentType: utils.toComponentType(k.type),
    filter: (b) => b.customId === k.id
  }) as unknown as InternalCollector;
  c.on('collect', async (i) => {
    const deserializer: InteractionDeserializer<T> = Deserializers[
      k.type
    ] as unknown as InteractionDeserializer<T>;
    const interaction = i as MCInteractionOfInput<T>;

    let args: InputUpdateArgs<T> | undefined = {
      item: k,
      oldValue: k.value,
      newValue: deserializer(k as T, k.value, interaction),
      interaction: interaction
    };
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
      const users = (i as UserSelectMenuInteraction).users!;
      console.log(users);
      const usi = k as UserStateInput;
      const currentValue = usi.value ?? undefined;
      const selection = i.values ?? undefined;
      args = {
        item: k,
        oldValue: currentValue,
        newValue: selection as unknown as T['value'],
        interaction: i
      } as InputUpdateArgs<T>;
    } else if (i.componentType === ComponentType.RoleSelect) {
      const roles = (i as RoleSelectMenuInteraction).roles!;
      console.log(roles);
      const usi = k as RoleStateInput;
      const currentValue = usi.value ?? undefined;
      const selection = i.values ?? undefined;
      args = {
        item: k,
        oldValue: currentValue,
        newValue: selection as unknown as T['value'],
        interaction: i
      } as InputUpdateArgs<T>;
    } else if (i.componentType === ComponentType.ChannelSelect) {
      const channels = (i as ChannelSelectMenuInteraction).channels!;
      console.log(channels);
      const usi = k as ChannelStateInput;
      const currentValue = usi.value ?? undefined;
      const selection = i.values ?? undefined;
      args = {
        item: k,
        oldValue: currentValue,
        newValue: selection as unknown as T['value'],
        interaction: i
      } as InputUpdateArgs<T>;
    } else if (i.componentType === ComponentType.MentionableSelect) {
      const users = i.users.map((u) => {
        return { id: u.id as User, type: 'user' } as Mentionable;
      });
      const roles = i.roles.map((r) => {
        return { id: r.id as Role, type: 'role' } as Mentionable;
      });
      const mentionables = users.concat(roles);
      const usi = k as ChannelStateInput;
      const currentValue = usi.value ?? undefined;
      const selection = mentionables ?? undefined;
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

class State<TShape extends MCRawShape> {
  private readonly _definition: MCStateDefinition<TShape>;
  private _state: InternalState;
  private _response: InteractionResponse | null = null;
  private _lastValidationResult: boolean = false;
  private readonly _emitter: evt.EventEmitter;
  private readonly _validator: (m: any) => boolean;

  constructor(def: MCStateDefinition<TShape>) {
    this._definition = def;
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
