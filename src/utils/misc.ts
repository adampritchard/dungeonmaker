export function assert(condition: any, message?: string): asserts condition {
  if (!condition) {
    let msg = 'Assertion Failed';
    if (message) msg = `${msg}: ${message}`;
    throw new Error(msg);
  }
}
