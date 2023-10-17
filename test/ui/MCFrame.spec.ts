import {
  createComponentUI,
  DefaultCompletedText,
  DefaultTimedOutText
} from '../../src/ui/MCFrame';
import type { InputFactory, Row, UIStatus } from '../../src/ui/MCFrame';
import {
  ButtonStyle,
  ComponentType,
  ButtonBuilder,
  StringSelectMenuBuilder,
  BaseMessageOptions
} from 'discord.js';
import { cMatches } from './Utils';
import { InlineMessagePromptOptions } from '../../src/prompts';
import * as sb from '../../src/schema';

const Model = ['ChatGPT4', 'ChatGPT3'] as const;
type ModelType = (typeof Model)[number];
const o = sb.optionInput<ModelType>({
  options: [
    { label: 'ChatGPT4', value: 'ChatGPT4', result: 'ChatGPT4' },
    { label: 'ChatGPT3', value: 'ChatGPT3', result: 'ChatGPT3' }
  ],
  placeholder: 'Select Me Please'
});
const s = sb.createMCSchema({
  hello: sb.boolInput({}),
  model: o
});
type SType = sb.Infer<typeof s>;

const uiDef: InlineMessagePromptOptions = {
  title: 'Enter'
};
const currentState: Partial<SType> = {
  hello: undefined,
  model: 'ChatGPT3'
};

const createUI = (
  validator: (s: SType) => boolean,
  status: UIStatus,
  customizations?: Partial<InlineMessagePromptOptions>
): BaseMessageOptions => {
  const customizedUiDef: InlineMessagePromptOptions = {
    ...uiDef
  };
  if (customizations?.submit) {
    customizedUiDef.submit = customizations.submit;
  }
  if (customizations?.timeout) {
    customizedUiDef.timeout = customizations.timeout;
  }
  return createComponentUI(
    customizedUiDef,
    s,
    currentState as SType,
    validator,
    status
  );
};

describe('createUI', () => {
  let validator: (s: SType) => boolean;
  let validatorCalls: SType[] = [];
  let inputFactory: InputFactory | undefined = undefined;

  beforeEach(() => {
    validator = (s) => {
      validatorCalls.push(s);
      return false;
    };
    validatorCalls = [];
  });

  test(`calls correct factories`, () => {
    const ui = createUI(validator, 'Open');
    expect(ui.content).toBe('Enter');
    let rows: Row[] = ui.components! as Row[];
    const btn = (rows[0].components[0] as ButtonBuilder).toJSON();
    const op = (rows[1].components[0] as StringSelectMenuBuilder).toJSON();
    const sub = (rows[2].components[0] as ButtonBuilder).toJSON();
    cMatches(
      {
        custom_id: 'hello',
        label: 'False',
        style: ButtonStyle.Danger,
        type: ComponentType.Button
      },
      btn
    );
    cMatches(
      {
        custom_id: 'model',
        type: ComponentType.StringSelect,
        placeholder: 'Select Me Please'
      },
      op
    );
    cMatches(
      {
        custom_id: 'submit',
        label: 'Submit',
        style: ButtonStyle.Primary,
        type: ComponentType.Button
      },
      sub
    );
  });

  test(`Disables submit when validator returns false with 'Open' UI status`, () => {
    const completedUi = createUI(() => false, 'Completed');
    expect(completedUi.content).toBe(DefaultCompletedText);
    let rows: Row[] = completedUi.components! as Row[];
    const submit = (rows[2].components[0] as ButtonBuilder).toJSON();
    expect(submit.disabled).toBeTruthy();
  });

  test(`Enables submit when validator returns true with 'Open' UI status`, () => {
    const completedUi = createUI(() => true, 'Completed');
    expect(completedUi.content).toBe(DefaultCompletedText);
    let rows: Row[] = completedUi.components! as Row[];
    const submit = (rows[2].components[0] as ButtonBuilder).toJSON();
    expect(submit.disabled).toBeTruthy();
  });

  test(`Disables elements when called with 'Completed' UI status`, () => {
    const completedUi = createUI(() => true, 'Completed');
    expect(completedUi.content).toBe(DefaultCompletedText);
    let rows: Row[] = completedUi.components! as Row[];
    const btn = (rows[0].components[0] as ButtonBuilder).toJSON();
    const op = (rows[1].components[0] as StringSelectMenuBuilder).toJSON();
    const submit = (rows[2].components[0] as ButtonBuilder).toJSON();
    expect(btn.disabled).toBeTruthy();
    expect(op.disabled).toBeTruthy();
    expect(submit.disabled).toBeTruthy();
  });

  test(`Disables elements when called with 'TimedOut' UI status`, () => {
    const timedoutUi = createUI(() => true, 'TimedOut');
    expect(timedoutUi.content).toBe(DefaultTimedOutText);
    let rows: Row[] = timedoutUi.components! as Row[];
    const btn = (rows[0].components[0] as ButtonBuilder).toJSON();
    const op = (rows[1].components[0] as StringSelectMenuBuilder).toJSON();
    const submit = (rows[2].components[0] as ButtonBuilder).toJSON();
    expect(btn.disabled).toBeTruthy();
    expect(op.disabled).toBeTruthy();
    expect(submit.disabled).toBeTruthy();
  });

  test(`Uses custom timeout text when provided for 'TimedOut' UI status`, () => {
    const timedoutUiCustomText = createUI(() => true, 'TimedOut', {
      timeout: {
        timeoutText: 'Too weak, too slow'
      }
    });
    expect(timedoutUiCustomText.content).toBe('Too weak, too slow');
  });

  test(`Uses custom completed text when provided for 'Completed' UI status`, () => {
    const completedUiCustomText = createUI(() => true, 'Completed', {
      submit: {
        submittedText: 'All done!'
      }
    });
    expect(completedUiCustomText.content).toBe('All done!');
  });
});
