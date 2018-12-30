"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../lib/index");
console.log(index_1.del);
console.log(index_1.del([1, 2, 3, 4], function (v, i) { return v === 2; }));
