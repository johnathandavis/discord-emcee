import { createComponentUI } from '../../src/ui/MCFrame';
import type { InputFactory, Row } from '../../src/ui/MCFrame';
import { ButtonStyle, ComponentType, ButtonBuilder, StringSelectMenuBuilder } from 'discord.js';
import { cMatches } from './Utils';
import { InlineMessagePromptOptions } from '../../src/prompts';
import * as sb from '../../src/schema';

const Model = ['ChatGPT4', 'ChatGPT3'] as const;
type ModelType = typeof Model[number];
const o = sb.optionInput<ModelType>({
    options: [
        { label: 'ChatGPT4', value: 'ChatGPT4', result: 'ChatGPT4' },
        { label: 'ChatGPT3', value: 'ChatGPT3', result: 'ChatGPT3' }
    ],
    placeholder: 'Select Me Please'
})
const s = sb.createMCSchema({
    hello: sb.boolInput({}),
    model: o
});
type SType = sb.Infer<typeof s>;

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

    test('calls correct factories', () => {
        
        let uiDef: InlineMessagePromptOptions = {
            title: 'Enter'
        };
        let currentState: Partial<SType> = {
            hello: undefined,
            model: 'ChatGPT3'
        };
        const ui = createComponentUI(uiDef, s, currentState as SType, validator, inputFactory);
        expect(ui.content).toBe('Enter');
        let rows: Row[] = ui.components! as Row[];
        const btn = (rows[0].components[0] as ButtonBuilder).toJSON();
        const op = (rows[1].components[0] as StringSelectMenuBuilder).toJSON();
        const sub = (rows[2].components[0] as ButtonBuilder).toJSON();
        cMatches({
            custom_id: 'hello',
            label: 'False',
            style: ButtonStyle.Danger,
            type: ComponentType.Button
        }, btn);
        cMatches({
            custom_id: 'model',
            type: ComponentType.StringSelect,
            placeholder: 'Select Me Please'
        }, op);
        cMatches({
            custom_id: 'submit',
            label: 'Submit',
            style: ButtonStyle.Primary,
            type: ComponentType.Button
        }, sub);
    });
});