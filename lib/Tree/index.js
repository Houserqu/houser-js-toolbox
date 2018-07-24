'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _build = require('./build');

var _build2 = _interopRequireDefault(_build);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var tree = {};

tree.build = _build2.default;

exports.default = tree;