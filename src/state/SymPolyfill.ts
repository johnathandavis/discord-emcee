if (!Symbol.dispose) {
  (Symbol as any).dispose ??= Symbol('Symbol.dispose');
}
