import { ButtonStyle } from 'discord.js';
import { BooleanStateInput, OptionStateInput } from '../src/Shared';
import * as sb from '../src/StateBuilder';

type Expect<T extends true> = T
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false

const b = sb.boolInput({});
type BType = sb.Infer<typeof b>;

const Model = ['ChatGPT4', 'ChatGPT3'] as const;
type ModelType = typeof Model[number];
const o = sb.optionInput<ModelType>({
    options: [
        { label: 'ChatGPT4', value: 'ChatGPT4', result: 'ChatGPT4' },
        { label: 'ChatGPT3', value: 'ChatGPT3', result: 'ChatGPT3' }
    ]
})

const s = sb.createSchema({
    hello: b,
    model: o
});
type SType = sb.Infer<typeof s>;

type cases = [
    Expect<Equal<BType, boolean>>,
    Expect<Equal<SType, { hello: boolean, model: ModelType }>>
]

describe('StateBuilder', () => {
    test('Creates Valid Boolean State Definition', () => {
        const schemaWithBool = sb.createSchema({
            hello: sb.boolInput({
                value: true,
                trueStyle: { text: 'On', style: ButtonStyle.Primary },
                falseStyle: { text: 'Off', style: ButtonStyle.Danger }
            }),
            model: sb.optionInput<ModelType>({
                placeholder: 'Select Model',
                value: 'ChatGPT4',
                options: [
                    { label: 'ChatGPT4', value: 'ChatGPT4', result: 'ChatGPT4' },
                    { label: 'ChatGPT3', value: 'ChatGPT3', result: 'ChatGPT3' }
                ]
            })
        })
        const sd = schemaWithBool.toStateDefinition();
        expect(sd.inputs.length).toBe(2);
        const ib = sd.inputs.filter(i => i.type === 'Boolean')[0] as BooleanStateInput;
        expect(ib.id).toBe('hello');
        expect(ib.type).toBe('Boolean');
        expect(ib.trueStyle).toStrictEqual({ text: 'On', style: ButtonStyle.Primary });
        expect(ib.falseStyle).toStrictEqual({ text: 'Off', style: ButtonStyle.Danger });

        const io = sd.inputs.filter(i => i.type === 'Option')[0] as OptionStateInput<ModelType>;
        expect(io.id).toBe('model');
        expect(io.type).toBe('Option');
        expect(io.value).toBe('ChatGPT4');
        expect(io.placeholder).toBe('Select Model');
        expect(io.options[0]).toStrictEqual({ label: 'ChatGPT4', value: 'ChatGPT4', result: 'ChatGPT4' });
        expect(io.options[1]).toStrictEqual({ label: 'ChatGPT3', value: 'ChatGPT3', result: 'ChatGPT3' });
    });
});