/**
 * javascript-lib-boilerplate v0.0.2
 * Javascript library boilerplate
 *
 * @author Sergio de la Garza
 * @license MIT
 * @preserve
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.MyModule = {}));
}(this, function (exports) { 'use strict';

	var sum = function sum(a, b) {
	  return a + b;
	};

	exports.sum = sum;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.umd.bundle.js.map
