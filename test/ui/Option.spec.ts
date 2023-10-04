import { createOption } from '../../src/ui/Option';
import { IOption, OptionStateInput } from '../../src/Shared';
import { ComponentType, APIStringSelectComponent, StringSelectMenuComponent } from 'discord.js';
import { cMatches } from './Utils';

describe('createOption', () => {

    test('creates correct selectmenu with defaults', () => {
        let op1: IOption<string> = {result: '1'};
        let op2: IOption<string> = {result: '2'};
        const defaultConfig: OptionStateInput<string> = {
            id: 'mode',
            type: 'Option',
            values: [ op1, op2 ]
        }

        const optionWithDefaults = createOption(defaultConfig, op1).toJSON();
        cMatches({
            custom_id: 'mode',
            type: ComponentType.StringSelect
        }, optionWithDefaults);
        expect(optionWithDefaults.options.length).toBe(2);

    });


    test('uses placeholder if provided', () => {
        let op1: IOption<string> = {result: '1'};
        let op2: IOption<string> = {result: '2'};
        const defaultConfig: OptionStateInput<string> = {
            id: 'eagerMode',
            type: 'Option',
            values: [ op1, op2 ],
            placeholder: 'Select Me Please'
        }

        const optionWithDefaults = createOption(defaultConfig, op1).toJSON();
        cMatches({
            placeholder: 'Select Me Please',
        }, optionWithDefaults);
        expect(optionWithDefaults.options.length).toBe(2);

    });

    test('uses schema original value if no current value', () => {
        let op1: IOption<string> = {result: '1'};
        let op2: IOption<string> = {result: '2'};
        const defaultConfig: OptionStateInput<string> = {
            id: 'eagerMode',
            type: 'Option',
            value: '2',
            values: [ op1, op2 ],
            placeholder: 'Select Me Please'
        }

        const optionWithDefaults = createOption(defaultConfig, undefined).toJSON();
        expect(optionWithDefaults.options[0].default).toBeFalsy();
        expect(optionWithDefaults.options[1].default).toBeTruthy();
        expect(optionWithDefaults.options.length).toBe(2);

    });
});