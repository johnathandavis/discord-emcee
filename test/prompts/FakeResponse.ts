import {
  MessageComponentType,
  MessageCollectorOptionsParams,
  InteractionCollector,
  MappedInteractionTypes
} from 'discord.js';
import { FakeCollector } from './FakeCollector';

class FakeResponse {
  private readonly collector: FakeCollector;

  constructor(collector: FakeCollector) {
    this.collector = collector;
  }

  createMessageComponentCollector = <T extends MessageComponentType>(
    options?: MessageCollectorOptionsParams<T>
  ): InteractionCollector<MappedInteractionTypes[T]> => {
    return this.collector as unknown as InteractionCollector<
      MappedInteractionTypes[T]
    >;
  };
}

export { FakeResponse };
