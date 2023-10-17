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
    value: ['1'],
    disabled: true,
    minValues: 4,
    maxValues: 7
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
        const optionWithDefaults = createOption(MinimalOptionState, [op1.result]).toJSON();
        cMatches({
            custom_id: 'mode',
            type: ComponentType.StringSelect
        }, optionWithDefaults);
        expect(optionWithDefaults.options.length).toBe(2);
    });


    test('creates correct selectmenu with optionals', () => {
        const optionWithDefaults = createOption(OptionStateWithOptionals, [op2.result]).toJSON();
        cMatches({
            placeholder: 'Select Me Please',
            disabled: true,
            min_values: 4,
            max_values: 7
        }, optionWithDefaults);
        expect(optionWithDefaults.options.length).toBe(2);
        expect(getSelected(optionWithDefaults)).toBe(op2.result);
    });

    test('uses schema original value if no current value', () => {
        let op1: IOption<string> = {result: '1'};
        let op2: IOption<string> = {result: '2'};
        const noValueConfig: OptionStateInput<string> = {
            id: 'eagerMode',
            type: 'Option',
            value: ['2'],
            options: [ op1, op2 ],
            placeholder: 'Select Me Please'
        }
        const op = createOption(noValueConfig, undefined).toJSON();
        expect(getSelected(op)).toBe('2');
    });
});