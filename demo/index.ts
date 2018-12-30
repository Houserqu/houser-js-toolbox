import { del } from '../lib/index';

console.log(del);

console.log((del as any)([1,2,3,4], (v, i) => v === 2));