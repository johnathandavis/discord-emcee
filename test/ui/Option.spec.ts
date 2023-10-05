import { createOption } from '../../src/ui/Option';
import { IOption, OptionStateInput } from '../../src/Shared';
import { ComponentType, APIStringSelectComponent } from 'discord.js';
import { cMatches } from './Utils';

type Modes = '1' | '2';
let op1: IOption<Modes> = {result: '1'};
let op2: IOption<Modes> = {result: '2'};

const MinimalOptionState: OptionStateInput<Modes> = {
    id: 'mode',
    type: 'Option',
    options: [op1, op2]
}
const OptionStateWithOptionals: OptionStateInput<Modes> = {
    ...MinimalOptionState,
    placeholder: 'Select Me Please',
    value: '1',
    disabled: true
}

const getSelected = (c: APIStringSelectComponent): string | null => {
    const se = c.options.filter(op => op.default);
    if (se.length === 0) {
        return null;
    }
    return se[0].value;
}

describe('createOption', () => {

    test('creates correct selectmenu with defaults', () => {
        const optionWithDefaults = createOption(MinimalOptionState, op1).toJSON();
        cMatches({
            custom_id: 'mode',
            type: ComponentType.StringSelect
        }, optionWithDefaults);
        expect(optionWithDefaults.options.length).toBe(2);
    });


    test('creates correct selectmenu with optionals', () => {
        const optionWithDefaults = createOption(OptionStateWithOptionals, op2).toJSON();
        cMatches({
            placeholder: 'Select Me Please',
            disabled: true
        }, optionWithDefaults);
        expect(optionWithDefaults.options.length).toBe(2);
        expect(getSelected(optionWithDefaults)).toBe(op2.result);
    });

    test('disables when instructed', () => {
        let op1: IOption<string> = {result: '1'};
        let op2: IOption<string> = {result: '2'};
        const disabledConfig: OptionStateInput<string> = {
            id: 'eagerMode',
            type: 'Option',
            options: [ op1, op2 ],
            disabled: true
        }

        const optionWithDefaults = createOption(disabledConfig, op1).toJSON();
        cMatches({
            disabled: true
        }, optionWithDefaults);
        expect(optionWithDefaults.options.length).toBe(2);

    });

    test('uses schema original value if no current value', () => {
        let op1: IOption<string> = {result: '1'};
        let op2: IOption<string> = {result: '2'};
        const noValueConfig: OptionStateInput<string> = {
            id: 'eagerMode',
            type: 'Option',
            value: '2',
            options: [ op1, op2 ],
            placeholder: 'Select Me Please'
        }
        const op = createOption(noValueConfig, undefined).toJSON();
        expect(getSelected(op)).toBe('2');
    });
});