import { ButtonStyle } from 'discord.js';

type InlineMessagePromptOptions = {
  title: string;
  submit?: {
    buttonText?: string;
    buttonStyle?: ButtonStyle;
    submittedText?: string;
  };
  timeout?: {
    durationSeconds?: number;
    timeoutText?: string;
  };
};

type ModalPromptOptions = {
  title: string;
  /**
   * @default 60
   */
  timeoutSeconds?: number;
};

class TimeOutError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = TimeOutError.Name;
  }

  static readonly Name: string = 'TimeOutError';
}

export { TimeOutError };
export type { InlineMessagePromptOptions, ModalPromptOptions };
