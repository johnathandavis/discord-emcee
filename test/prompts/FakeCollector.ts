import { ButtonInteraction, MessageComponentInteraction } from 'discord.js';

type CollectHandler = (i: MessageComponentInteraction) => Promise<void>;
type AttachCallback = (name: string, handler: CollectHandler) => void;
class FakeCollector {
  private _callback?: AttachCallback;
  private _disposeCallCount: number = 0;

  get disposeCallCount(): number {
    return this._disposeCallCount;
  }

  waitForAttachAsync = async (
    timeoutSeconds?: number
  ): Promise<CollectHandler> => {
    return await new Promise<CollectHandler>((resolve, reject) => {
      const setTimeoutId = setTimeout(
        () => {
          reject(new Error('Wait for attachment timed out!'));
        },
        (timeoutSeconds ?? 3) * 1000
      );
      this._callback = (e, h) => {
        clearTimeout(setTimeoutId);
        const invoker = async (i: MessageComponentInteraction) => h(i);
        resolve(invoker);
      };
    });
  };

  on = (event: 'collect', handler: CollectHandler) => {
    if (this._callback) {
      this._callback(event, handler);
    }
  };

  dispose = () => {
    this._disposeCallCount++;
  };
}

export { FakeCollector };
