import { createOptionValue } from '../../src/ui/Option';
import { IOption, OptionStateInput } from '../../src/Shared';
import { ComponentType, StringSelectMenuOptionBuilder } from 'discord.js';
import { cMatches } from './Utils';

const MinimalOptions: IOption<string> = {result: '1'};
const LabeledOption: IOption<string> = {
    result: '2', 
    label: 'Two'
};
const ValuedOption: IOption<string> = {
    result: '3',
    value: 'tres'
};
const DescribedOption: IOption<string> = {
    result: '4',
    description: 'The number four'
};

const selected = <T>(...r: T[]): Set<T> => new Set<T>(r);

describe('createOptionValue', () => {

    test('creates correct option value with minimal config', () => {

        let selectedOption = ValuedOption;
        const minimalValue = createOptionValue(MinimalOptions, selected(selectedOption.result)).toJSON();
        cMatches({
            label: '1',
            value: '1'
        }, minimalValue);

    });

    test('sets default when option value equals the selected value', () => {

        let selectedOption = MinimalOptions;
        const selectedValue = createOptionValue(MinimalOptions, selected(selectedOption.result)).toJSON();
        cMatches({
            label: '1',
            value: '1',
            default: true
        }, selectedValue);

    });

    test('uses label if provided', () => {

        let selectedOption = ValuedOption;
        const labeledValue = createOptionValue(LabeledOption, selected(selectedOption.result)).toJSON();
        cMatches({
            label: 'Two',
            value: '2'
        }, labeledValue);

    });

    test('uses value if provided', () => {

        let selectedOption = DescribedOption;
        const valuedValue = createOptionValue(ValuedOption, selected(selectedOption.result)).toJSON();
        cMatches({
            label: '3',
            value: 'tres'
        }, valuedValue);

    });

    test('uses description if provided', () => {
        let selectedOption = ValuedOption;
        const describedValue = createOptionValue(DescribedOption, selected(selectedOption.result)).toJSON();
        cMatches({
            description: 'The number four'
        }, describedValue);
    });

    test('converts result to string', () => {
        const NumericalOption: IOption<number> = {result: 1};
        const numericalValue = createOptionValue(NumericalOption, selected(NumericalOption.result)).toJSON();
        cMatches({
            label: '1',
            value: '1'
        }, numericalValue);
    });
});