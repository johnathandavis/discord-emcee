import ContextHelper from "../ContextHelper";
import path from 'path';

const pkgRoot = path.resolve(__dirname, '../');
const polyFill = path.join(pkgRoot, 'src', 'SymPolyfill.ts');

const clear = () => {
    if (Symbol.dispose) {
        delete (Symbol as any)['dispose'];
    }
}

const init = () => {
    if (Symbol.dispose) {
        clear();
    }
    (Symbol as any)['dispose'] = Symbol('Symbol.dispose_wrong');
}

describe('SymPolyfill', () => {

    test('Creates dispose when not available', async () => {
        clear();
        const dBefore = (Symbol as any)['dispose'];
        require('../../src/state/SymPolyfill');
        const dAfter = (Symbol as any)['dispose'];
        expect(dBefore).toBeUndefined();
        expect(dAfter).toBeDefined();
    });

    test('Creates dispose when not available', async () => {
        init();
        const dBefore = (Symbol as any)['dispose'];
        require('../../src/state/SymPolyfill');
        const dAfter = (Symbol as any)['dispose'];
        expect(dBefore).toBe(dAfter);
    });

});