if (!Symbol.dispose) {
  (Symbol as any).dispose ??= Symbol('Symbol.dispose');
}
if (!Symbol.asyncDispose) {
  (Symbol as any).asyncDispose ??= Symbol('Symbol.asyncDispose');
}
