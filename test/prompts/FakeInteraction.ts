import {
  InteractionReplyOptions,
  InteractionResponse,
  MessagePayload
} from 'discord.js';
import { FakeResponse } from './FakeResponse';

class FakeInteraction {
  private readonly response: FakeResponse;
  private _payload: InteractionReplyOptions | undefined = undefined;

  constructor(response: FakeResponse) {
    this.response = response;
  }

  reply = async (
    options: InteractionReplyOptions
  ): Promise<InteractionResponse> => {
    this._payload = options;
    return this.response as unknown as InteractionResponse;
  };

  get replyMessagePayload(): InteractionReplyOptions | undefined {
    return this._payload;
  }
}

export { FakeInteraction };
