(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.TweakpaneRotationInputPlugin = {}));
}(this, (function (exports) { 'use strict';

    function forceCast(v) {
        return v;
    }
    function isEmpty(value) {
        return value === null || value === undefined;
    }

    const CREATE_MESSAGE_MAP = {
        alreadydisposed: () => 'View has been already disposed',
        invalidparams: (context) => `Invalid parameters for '${context.name}'`,
        nomatchingcontroller: (context) => `No matching controller for '${context.key}'`,
        nomatchingview: (context) => `No matching view for '${JSON.stringify(context.params)}'`,
        notbindable: () => `Value is not bindable`,
        propertynotfound: (context) => `Property '${context.name}' not found`,
        shouldneverhappen: () => 'This error should never happen',
    };
    class TpError {
        constructor(config) {
            var _a;
            this.message =
                (_a = CREATE_MESSAGE_MAP[config.type](forceCast(config.context))) !== null && _a !== void 0 ? _a : 'Unexpected error';
            this.name = this.constructor.name;
            this.stack = new Error(this.message).stack;
            this.type = config.type;
        }
        static alreadyDisposed() {
            return new TpError({ type: 'alreadydisposed' });
        }
        static notBindable() {
            return new TpError({
                type: 'notbindable',
            });
        }
        static propertyNotFound(name) {
            return new TpError({
                type: 'propertynotfound',
                context: {
                    name: name,
                },
            });
        }
        static shouldNeverHappen() {
            return new TpError({ type: 'shouldneverhappen' });
        }
    }

    class Emitter {
        constructor() {
            this.observers_ = {};
        }
        on(eventName, handler) {
            let observers = this.observers_[eventName];
            if (!observers) {
                observers = this.observers_[eventName] = [];
            }
            observers.push({
                handler: handler,
            });
            return this;
        }
        off(eventName, handler) {
            const observers = this.observers_[eventName];
            if (observers) {
                this.observers_[eventName] = observers.filter((observer) => {
                    return observer.handler !== handler;
                });
            }
            return this;
        }
        emit(eventName, event) {
            const observers = this.observers_[eventName];
            if (!observers) {
                return;
            }
            observers.forEach((observer) => {
                observer.handler(event);
            });
        }
    }

    const PREFIX = 'tp';
    function ClassName(viewName) {
        const fn = (opt_elementName, opt_modifier) => {
            return [
                PREFIX,
                '-',
                viewName,
                'v',
                opt_elementName ? `_${opt_elementName}` : '',
                opt_modifier ? `-${opt_modifier}` : '',
            ].join('');
        };
        return fn;
    }

    function compose(h1, h2) {
        return (input) => h2(h1(input));
    }
    function extractValue(ev) {
        return ev.rawValue;
    }
    function bindValue(value, applyValue) {
        value.emitter.on('change', compose(extractValue, applyValue));
        applyValue(value.rawValue);
    }
    function bindValueMap(valueMap, key, applyValue) {
        bindValue(valueMap.value(key), applyValue);
    }

    function applyClass(elem, className, active) {
        if (active) {
            elem.classList.add(className);
        }
        else {
            elem.classList.remove(className);
        }
    }
    function valueToClassName(elem, className) {
        return (value) => {
            applyClass(elem, className, value);
        };
    }

    class BoundValue {
        constructor(initialValue, config) {
            var _a;
            this.constraint_ = config === null || config === void 0 ? void 0 : config.constraint;
            this.equals_ = (_a = config === null || config === void 0 ? void 0 : config.equals) !== null && _a !== void 0 ? _a : ((v1, v2) => v1 === v2);
            this.emitter = new Emitter();
            this.rawValue_ = initialValue;
        }
        get constraint() {
            return this.constraint_;
        }
        get rawValue() {
            return this.rawValue_;
        }
        set rawValue(rawValue) {
            this.setRawValue(rawValue, {
                forceEmit: false,
                last: true,
            });
        }
        setRawValue(rawValue, options) {
            const opts = options !== null && options !== void 0 ? options : {
                forceEmit: false,
                last: true,
            };
            const constrainedValue = this.constraint_
                ? this.constraint_.constrain(rawValue)
                : rawValue;
            const changed = !this.equals_(this.rawValue_, constrainedValue);
            if (!changed && !opts.forceEmit) {
                return;
            }
            this.emitter.emit('beforechange', {
                sender: this,
            });
            this.rawValue_ = constrainedValue;
            this.emitter.emit('change', {
                options: opts,
                rawValue: constrainedValue,
                sender: this,
            });
        }
    }

    class PrimitiveValue {
        constructor(initialValue) {
            this.emitter = new Emitter();
            this.value_ = initialValue;
        }
        get rawValue() {
            return this.value_;
        }
        set rawValue(value) {
            this.setRawValue(value, {
                forceEmit: false,
                last: true,
            });
        }
        setRawValue(value, options) {
            const opts = options !== null && options !== void 0 ? options : {
                forceEmit: false,
                last: true,
            };
            if (this.value_ === value && !opts.forceEmit) {
                return;
            }
            this.emitter.emit('beforechange', {
                sender: this,
            });
            this.value_ = value;
            this.emitter.emit('change', {
                options: opts,
                rawValue: this.value_,
                sender: this,
            });
        }
    }

    function createValue(initialValue, config) {
        const constraint = config === null || config === void 0 ? void 0 : config.constraint;
        const equals = config === null || config === void 0 ? void 0 : config.equals;
        if (!constraint && !equals) {
            return new PrimitiveValue(initialValue);
        }
        return new BoundValue(initialValue, config);
    }

    class ValueMap {
        constructor(valueMap) {
            this.emitter = new Emitter();
            this.valMap_ = valueMap;
            for (const key in this.valMap_) {
                const v = this.valMap_[key];
                v.emitter.on('change', () => {
                    this.emitter.emit('change', {
                        key: key,
                        sender: this,
                    });
                });
            }
        }
        static createCore(initialValue) {
            const keys = Object.keys(initialValue);
            return keys.reduce((o, key) => {
                return Object.assign(o, {
                    [key]: createValue(initialValue[key]),
                });
            }, {});
        }
        static fromObject(initialValue) {
            const core = this.createCore(initialValue);
            return new ValueMap(core);
        }
        get(key) {
            return this.valMap_[key].rawValue;
        }
        set(key, value) {
            this.valMap_[key].rawValue = value;
        }
        value(key) {
            return this.valMap_[key];
        }
    }

    function parseObject(value, keyToParserMap) {
        const keys = Object.keys(keyToParserMap);
        const result = keys.reduce((tmp, key) => {
            if (tmp === undefined) {
                return undefined;
            }
            const parser = keyToParserMap[key];
            const result = parser(value[key]);
            return result.succeeded
                ? Object.assign(Object.assign({}, tmp), { [key]: result.value }) : undefined;
        }, {});
        return forceCast(result);
    }
    function parseArray(value, parseItem) {
        return value.reduce((tmp, item) => {
            if (tmp === undefined) {
                return undefined;
            }
            const result = parseItem(item);
            if (!result.succeeded || result.value === undefined) {
                return undefined;
            }
            return [...tmp, result.value];
        }, []);
    }
    function isObject(value) {
        if (value === null) {
            return false;
        }
        return typeof value === 'object';
    }
    function createParamsParserBuilder(parse) {
        return (optional) => (v) => {
            if (!optional && v === undefined) {
                return {
                    succeeded: false,
                    value: undefined,
                };
            }
            if (optional && v === undefined) {
                return {
                    succeeded: true,
                    value: undefined,
                };
            }
            const result = parse(v);
            return result !== undefined
                ? {
                    succeeded: true,
                    value: result,
                }
                : {
                    succeeded: false,
                    value: undefined,
                };
        };
    }
    function createParamsParserBuilders(optional) {
        return {
            custom: (parse) => createParamsParserBuilder(parse)(optional),
            boolean: createParamsParserBuilder((v) => typeof v === 'boolean' ? v : undefined)(optional),
            number: createParamsParserBuilder((v) => typeof v === 'number' ? v : undefined)(optional),
            string: createParamsParserBuilder((v) => typeof v === 'string' ? v : undefined)(optional),
            function: createParamsParserBuilder((v) =>
            typeof v === 'function' ? v : undefined)(optional),
            constant: (value) => createParamsParserBuilder((v) => (v === value ? value : undefined))(optional),
            raw: createParamsParserBuilder((v) => v)(optional),
            object: (keyToParserMap) => createParamsParserBuilder((v) => {
                if (!isObject(v)) {
                    return undefined;
                }
                return parseObject(v, keyToParserMap);
            })(optional),
            array: (itemParser) => createParamsParserBuilder((v) => {
                if (!Array.isArray(v)) {
                    return undefined;
                }
                return parseArray(v, itemParser);
            })(optional),
        };
    }
    const ParamsParsers = {
        optional: createParamsParserBuilders(true),
        required: createParamsParserBuilders(false),
    };
    function parseParams(value, keyToParserMap) {
        const result = ParamsParsers.required.object(keyToParserMap)(value);
        return result.succeeded ? result.value : undefined;
    }

    const SVG_NS = 'http://www.w3.org/2000/svg';
    function forceReflow(element) {
        element.offsetHeight;
    }
    function disableTransitionTemporarily(element, callback) {
        const t = element.style.transition;
        element.style.transition = 'none';
        callback();
        element.style.transition = t;
    }
    function supportsTouch(doc) {
        return doc.ontouchstart !== undefined;
    }
    function findNextTarget(ev) {
        if (ev.relatedTarget) {
            return forceCast(ev.relatedTarget);
        }
        if ('explicitOriginalTarget' in ev) {
            return ev.explicitOriginalTarget;
        }
        return null;
    }

    class Foldable extends ValueMap {
        constructor(valueMap) {
            super(valueMap);
        }
        static create(expanded) {
            const coreObj = {
                completed: true,
                expanded: expanded,
                expandedHeight: null,
                shouldFixHeight: false,
                temporaryExpanded: null,
            };
            const core = ValueMap.createCore(coreObj);
            return new Foldable(core);
        }
        get styleExpanded() {
            var _a;
            return (_a = this.get('temporaryExpanded')) !== null && _a !== void 0 ? _a : this.get('expanded');
        }
        get styleHeight() {
            if (!this.styleExpanded) {
                return '0';
            }
            const exHeight = this.get('expandedHeight');
            if (this.get('shouldFixHeight') && !isEmpty(exHeight)) {
                return `${exHeight}px`;
            }
            return 'auto';
        }
        bindExpandedClass(elem, expandedClassName) {
            bindValueMap(this, 'expanded', () => {
                const expanded = this.styleExpanded;
                if (expanded) {
                    elem.classList.add(expandedClassName);
                }
                else {
                    elem.classList.remove(expandedClassName);
                }
            });
        }
    }
    function computeExpandedFolderHeight(folder, containerElement) {
        let height = 0;
        disableTransitionTemporarily(containerElement, () => {
            folder.set('expandedHeight', null);
            folder.set('temporaryExpanded', true);
            forceReflow(containerElement);
            height = containerElement.clientHeight;
            folder.set('temporaryExpanded', null);
            forceReflow(containerElement);
        });
        return height;
    }
    function applyHeight(foldable, elem) {
        elem.style.height = foldable.styleHeight;
    }
    function bindFoldable(foldable, elem) {
        foldable.value('expanded').emitter.on('beforechange', () => {
            foldable.set('completed', false);
            if (isEmpty(foldable.get('expandedHeight'))) {
                foldable.set('expandedHeight', computeExpandedFolderHeight(foldable, elem));
            }
            foldable.set('shouldFixHeight', true);
            forceReflow(elem);
        });
        foldable.emitter.on('change', () => {
            applyHeight(foldable, elem);
        });
        applyHeight(foldable, elem);
        elem.addEventListener('transitionend', (ev) => {
            if (ev.propertyName !== 'height') {
                return;
            }
            foldable.set('shouldFixHeight', false);
            foldable.set('expandedHeight', null);
            foldable.set('completed', true);
        });
    }

    class CompositeConstraint {
        constructor(constraints) {
            this.constraints = constraints;
        }
        constrain(value) {
            return this.constraints.reduce((result, c) => {
                return c.constrain(result);
            }, value);
        }
    }

    class RangeConstraint {
        constructor(config) {
            this.maxValue = config.max;
            this.minValue = config.min;
        }
        constrain(value) {
            let result = value;
            if (!isEmpty(this.minValue)) {
                result = Math.max(result, this.minValue);
            }
            if (!isEmpty(this.maxValue)) {
                result = Math.min(result, this.maxValue);
            }
            return result;
        }
    }

    class StepConstraint {
        constructor(step) {
            this.step = step;
        }
        constrain(value) {
            const r = value < 0
                ? -Math.round(-value / this.step)
                : Math.round(value / this.step);
            return r * this.step;
        }
    }

    const className$5 = ClassName('pop');
    class PopupView {
        constructor(doc, config) {
            this.element = doc.createElement('div');
            this.element.classList.add(className$5());
            config.viewProps.bindClassModifiers(this.element);
            bindValue(config.shows, valueToClassName(this.element, className$5(undefined, 'v')));
        }
    }

    class PopupController {
        constructor(doc, config) {
            this.shows = createValue(false);
            this.viewProps = config.viewProps;
            this.view = new PopupView(doc, {
                shows: this.shows,
                viewProps: this.viewProps,
            });
        }
    }

    class NumberLiteralNode {
        constructor(text) {
            this.text = text;
        }
        evaluate() {
            return Number(this.text);
        }
        toString() {
            return this.text;
        }
    }
    const BINARY_OPERATION_MAP = {
        '**': (v1, v2) => Math.pow(v1, v2),
        '*': (v1, v2) => v1 * v2,
        '/': (v1, v2) => v1 / v2,
        '%': (v1, v2) => v1 % v2,
        '+': (v1, v2) => v1 + v2,
        '-': (v1, v2) => v1 - v2,
        '<<': (v1, v2) => v1 << v2,
        '>>': (v1, v2) => v1 >> v2,
        '>>>': (v1, v2) => v1 >>> v2,
        '&': (v1, v2) => v1 & v2,
        '^': (v1, v2) => v1 ^ v2,
        '|': (v1, v2) => v1 | v2,
    };
    class BinaryOperationNode {
        constructor(operator, left, right) {
            this.left = left;
            this.operator = operator;
            this.right = right;
        }
        evaluate() {
            const op = BINARY_OPERATION_MAP[this.operator];
            if (!op) {
                throw new Error(`unexpected binary operator: '${this.operator}`);
            }
            return op(this.left.evaluate(), this.right.evaluate());
        }
        toString() {
            return [
                'b(',
                this.left.toString(),
                this.operator,
                this.right.toString(),
                ')',
            ].join(' ');
        }
    }
    const UNARY_OPERATION_MAP = {
        '+': (v) => v,
        '-': (v) => -v,
        '~': (v) => ~v,
    };
    class UnaryOperationNode {
        constructor(operator, expr) {
            this.operator = operator;
            this.expression = expr;
        }
        evaluate() {
            const op = UNARY_OPERATION_MAP[this.operator];
            if (!op) {
                throw new Error(`unexpected unary operator: '${this.operator}`);
            }
            return op(this.expression.evaluate());
        }
        toString() {
            return ['u(', this.operator, this.expression.toString(), ')'].join(' ');
        }
    }

    function combineReader(parsers) {
        return (text, cursor) => {
            for (let i = 0; i < parsers.length; i++) {
                const result = parsers[i](text, cursor);
                if (result !== '') {
                    return result;
                }
            }
            return '';
        };
    }
    function readWhitespace(text, cursor) {
        var _a;
        const m = text.substr(cursor).match(/^\s+/);
        return (_a = (m && m[0])) !== null && _a !== void 0 ? _a : '';
    }
    function readNonZeroDigit(text, cursor) {
        const ch = text.substr(cursor, 1);
        return ch.match(/^[1-9]$/) ? ch : '';
    }
    function readDecimalDigits(text, cursor) {
        var _a;
        const m = text.substr(cursor).match(/^[0-9]+/);
        return (_a = (m && m[0])) !== null && _a !== void 0 ? _a : '';
    }
    function readSignedInteger(text, cursor) {
        const ds = readDecimalDigits(text, cursor);
        if (ds !== '') {
            return ds;
        }
        const sign = text.substr(cursor, 1);
        cursor += 1;
        if (sign !== '-' && sign !== '+') {
            return '';
        }
        const sds = readDecimalDigits(text, cursor);
        if (sds === '') {
            return '';
        }
        return sign + sds;
    }
    function readExponentPart(text, cursor) {
        const e = text.substr(cursor, 1);
        cursor += 1;
        if (e.toLowerCase() !== 'e') {
            return '';
        }
        const si = readSignedInteger(text, cursor);
        if (si === '') {
            return '';
        }
        return e + si;
    }
    function readDecimalIntegerLiteral(text, cursor) {
        const ch = text.substr(cursor, 1);
        if (ch === '0') {
            return ch;
        }
        const nzd = readNonZeroDigit(text, cursor);
        cursor += nzd.length;
        if (nzd === '') {
            return '';
        }
        return nzd + readDecimalDigits(text, cursor);
    }
    function readDecimalLiteral1(text, cursor) {
        const dil = readDecimalIntegerLiteral(text, cursor);
        cursor += dil.length;
        if (dil === '') {
            return '';
        }
        const dot = text.substr(cursor, 1);
        cursor += dot.length;
        if (dot !== '.') {
            return '';
        }
        const dds = readDecimalDigits(text, cursor);
        cursor += dds.length;
        return dil + dot + dds + readExponentPart(text, cursor);
    }
    function readDecimalLiteral2(text, cursor) {
        const dot = text.substr(cursor, 1);
        cursor += dot.length;
        if (dot !== '.') {
            return '';
        }
        const dds = readDecimalDigits(text, cursor);
        cursor += dds.length;
        if (dds === '') {
            return '';
        }
        return dot + dds + readExponentPart(text, cursor);
    }
    function readDecimalLiteral3(text, cursor) {
        const dil = readDecimalIntegerLiteral(text, cursor);
        cursor += dil.length;
        if (dil === '') {
            return '';
        }
        return dil + readExponentPart(text, cursor);
    }
    const readDecimalLiteral = combineReader([
        readDecimalLiteral1,
        readDecimalLiteral2,
        readDecimalLiteral3,
    ]);
    function parseBinaryDigits(text, cursor) {
        var _a;
        const m = text.substr(cursor).match(/^[01]+/);
        return (_a = (m && m[0])) !== null && _a !== void 0 ? _a : '';
    }
    function readBinaryIntegerLiteral(text, cursor) {
        const prefix = text.substr(cursor, 2);
        cursor += prefix.length;
        if (prefix.toLowerCase() !== '0b') {
            return '';
        }
        const bds = parseBinaryDigits(text, cursor);
        if (bds === '') {
            return '';
        }
        return prefix + bds;
    }
    function readOctalDigits(text, cursor) {
        var _a;
        const m = text.substr(cursor).match(/^[0-7]+/);
        return (_a = (m && m[0])) !== null && _a !== void 0 ? _a : '';
    }
    function readOctalIntegerLiteral(text, cursor) {
        const prefix = text.substr(cursor, 2);
        cursor += prefix.length;
        if (prefix.toLowerCase() !== '0o') {
            return '';
        }
        const ods = readOctalDigits(text, cursor);
        if (ods === '') {
            return '';
        }
        return prefix + ods;
    }
    function readHexDigits(text, cursor) {
        var _a;
        const m = text.substr(cursor).match(/^[0-9a-f]+/i);
        return (_a = (m && m[0])) !== null && _a !== void 0 ? _a : '';
    }
    function readHexIntegerLiteral(text, cursor) {
        const prefix = text.substr(cursor, 2);
        cursor += prefix.length;
        if (prefix.toLowerCase() !== '0x') {
            return '';
        }
        const hds = readHexDigits(text, cursor);
        if (hds === '') {
            return '';
        }
        return prefix + hds;
    }
    const readNonDecimalIntegerLiteral = combineReader([
        readBinaryIntegerLiteral,
        readOctalIntegerLiteral,
        readHexIntegerLiteral,
    ]);
    const readNumericLiteral = combineReader([
        readNonDecimalIntegerLiteral,
        readDecimalLiteral,
    ]);

    function parseLiteral(text, cursor) {
        const num = readNumericLiteral(text, cursor);
        cursor += num.length;
        if (num === '') {
            return null;
        }
        return {
            evaluable: new NumberLiteralNode(num),
            cursor: cursor,
        };
    }
    function parseParenthesizedExpression(text, cursor) {
        const op = text.substr(cursor, 1);
        cursor += op.length;
        if (op !== '(') {
            return null;
        }
        const expr = parseExpression(text, cursor);
        if (!expr) {
            return null;
        }
        cursor = expr.cursor;
        cursor += readWhitespace(text, cursor).length;
        const cl = text.substr(cursor, 1);
        cursor += cl.length;
        if (cl !== ')') {
            return null;
        }
        return {
            evaluable: expr.evaluable,
            cursor: cursor,
        };
    }
    function parsePrimaryExpression(text, cursor) {
        return (parseLiteral(text, cursor) || parseParenthesizedExpression(text, cursor));
    }
    function parseUnaryExpression(text, cursor) {
        const expr = parsePrimaryExpression(text, cursor);
        if (expr) {
            return expr;
        }
        const op = text.substr(cursor, 1);
        cursor += op.length;
        if (op !== '+' && op !== '-' && op !== '~') {
            return null;
        }
        const num = parseUnaryExpression(text, cursor);
        if (!num) {
            return null;
        }
        cursor = num.cursor;
        return {
            cursor: cursor,
            evaluable: new UnaryOperationNode(op, num.evaluable),
        };
    }
    function readBinaryOperator(ops, text, cursor) {
        cursor += readWhitespace(text, cursor).length;
        const op = ops.filter((op) => text.startsWith(op, cursor))[0];
        if (!op) {
            return null;
        }
        cursor += op.length;
        cursor += readWhitespace(text, cursor).length;
        return {
            cursor: cursor,
            operator: op,
        };
    }
    function createBinaryOperationExpressionParser(exprParser, ops) {
        return (text, cursor) => {
            const firstExpr = exprParser(text, cursor);
            if (!firstExpr) {
                return null;
            }
            cursor = firstExpr.cursor;
            let expr = firstExpr.evaluable;
            for (;;) {
                const op = readBinaryOperator(ops, text, cursor);
                if (!op) {
                    break;
                }
                cursor = op.cursor;
                const nextExpr = exprParser(text, cursor);
                if (!nextExpr) {
                    return null;
                }
                cursor = nextExpr.cursor;
                expr = new BinaryOperationNode(op.operator, expr, nextExpr.evaluable);
            }
            return expr
                ? {
                    cursor: cursor,
                    evaluable: expr,
                }
                : null;
        };
    }
    const parseBinaryOperationExpression = [
        ['**'],
        ['*', '/', '%'],
        ['+', '-'],
        ['<<', '>>>', '>>'],
        ['&'],
        ['^'],
        ['|'],
    ].reduce((parser, ops) => {
        return createBinaryOperationExpressionParser(parser, ops);
    }, parseUnaryExpression);
    function parseExpression(text, cursor) {
        cursor += readWhitespace(text, cursor).length;
        return parseBinaryOperationExpression(text, cursor);
    }
    function parseEcmaNumberExpression(text) {
        const expr = parseExpression(text, 0);
        if (!expr) {
            return null;
        }
        const cursor = expr.cursor + readWhitespace(text, expr.cursor).length;
        if (cursor !== text.length) {
            return null;
        }
        return expr.evaluable;
    }

    function parseNumber(text) {
        var _a;
        const r = parseEcmaNumberExpression(text);
        return (_a = r === null || r === void 0 ? void 0 : r.evaluate()) !== null && _a !== void 0 ? _a : null;
    }
    function createNumberFormatter(digits) {
        return (value) => {
            return value.toFixed(Math.max(Math.min(digits, 20), 0));
        };
    }

    function connectValues({ primary, secondary, forward, backward, }) {
        let changing = false;
        function preventFeedback(callback) {
            if (changing) {
                return;
            }
            changing = true;
            callback();
            changing = false;
        }
        primary.emitter.on('change', (ev) => {
            preventFeedback(() => {
                secondary.setRawValue(forward(primary, secondary), ev.options);
            });
        });
        secondary.emitter.on('change', (ev) => {
            preventFeedback(() => {
                primary.setRawValue(backward(primary, secondary), ev.options);
            });
            preventFeedback(() => {
                secondary.setRawValue(forward(primary, secondary), ev.options);
            });
        });
        preventFeedback(() => {
            secondary.setRawValue(forward(primary, secondary), {
                forceEmit: false,
                last: true,
            });
        });
    }

    function getStepForKey(baseStep, keys) {
        const step = baseStep * (keys.altKey ? 0.1 : 1) * (keys.shiftKey ? 10 : 1);
        if (keys.upKey) {
            return +step;
        }
        else if (keys.downKey) {
            return -step;
        }
        return 0;
    }
    function getVerticalStepKeys(ev) {
        return {
            altKey: ev.altKey,
            downKey: ev.key === 'ArrowDown',
            shiftKey: ev.shiftKey,
            upKey: ev.key === 'ArrowUp',
        };
    }
    function getHorizontalStepKeys(ev) {
        return {
            altKey: ev.altKey,
            downKey: ev.key === 'ArrowLeft',
            shiftKey: ev.shiftKey,
            upKey: ev.key === 'ArrowRight',
        };
    }
    function isVerticalArrowKey(key) {
        return key === 'ArrowUp' || key === 'ArrowDown';
    }
    function isArrowKey(key) {
        return isVerticalArrowKey(key) || key === 'ArrowLeft' || key === 'ArrowRight';
    }

    function computeOffset(ev, elem) {
        const win = elem.ownerDocument.defaultView;
        const rect = elem.getBoundingClientRect();
        return {
            x: ev.pageX - (((win && win.scrollX) || 0) + rect.left),
            y: ev.pageY - (((win && win.scrollY) || 0) + rect.top),
        };
    }
    class PointerHandler {
        constructor(element) {
            this.lastTouch_ = null;
            this.onDocumentMouseMove_ = this.onDocumentMouseMove_.bind(this);
            this.onDocumentMouseUp_ = this.onDocumentMouseUp_.bind(this);
            this.onMouseDown_ = this.onMouseDown_.bind(this);
            this.onTouchEnd_ = this.onTouchEnd_.bind(this);
            this.onTouchMove_ = this.onTouchMove_.bind(this);
            this.onTouchStart_ = this.onTouchStart_.bind(this);
            this.elem_ = element;
            this.emitter = new Emitter();
            element.addEventListener('touchstart', this.onTouchStart_, {
                passive: false,
            });
            element.addEventListener('touchmove', this.onTouchMove_, {
                passive: true,
            });
            element.addEventListener('touchend', this.onTouchEnd_);
            element.addEventListener('mousedown', this.onMouseDown_);
        }
        computePosition_(offset) {
            const rect = this.elem_.getBoundingClientRect();
            return {
                bounds: {
                    width: rect.width,
                    height: rect.height,
                },
                point: offset
                    ? {
                        x: offset.x,
                        y: offset.y,
                    }
                    : null,
            };
        }
        onMouseDown_(ev) {
            var _a;
            ev.preventDefault();
            (_a = ev.currentTarget) === null || _a === void 0 ? void 0 : _a.focus();
            const doc = this.elem_.ownerDocument;
            doc.addEventListener('mousemove', this.onDocumentMouseMove_);
            doc.addEventListener('mouseup', this.onDocumentMouseUp_);
            this.emitter.emit('down', {
                altKey: ev.altKey,
                data: this.computePosition_(computeOffset(ev, this.elem_)),
                sender: this,
                shiftKey: ev.shiftKey,
            });
        }
        onDocumentMouseMove_(ev) {
            this.emitter.emit('move', {
                altKey: ev.altKey,
                data: this.computePosition_(computeOffset(ev, this.elem_)),
                sender: this,
                shiftKey: ev.shiftKey,
            });
        }
        onDocumentMouseUp_(ev) {
            const doc = this.elem_.ownerDocument;
            doc.removeEventListener('mousemove', this.onDocumentMouseMove_);
            doc.removeEventListener('mouseup', this.onDocumentMouseUp_);
            this.emitter.emit('up', {
                altKey: ev.altKey,
                data: this.computePosition_(computeOffset(ev, this.elem_)),
                sender: this,
                shiftKey: ev.shiftKey,
            });
        }
        onTouchStart_(ev) {
            ev.preventDefault();
            const touch = ev.targetTouches.item(0);
            const rect = this.elem_.getBoundingClientRect();
            this.emitter.emit('down', {
                altKey: ev.altKey,
                data: this.computePosition_(touch
                    ? {
                        x: touch.clientX - rect.left,
                        y: touch.clientY - rect.top,
                    }
                    : undefined),
                sender: this,
                shiftKey: ev.shiftKey,
            });
            this.lastTouch_ = touch;
        }
        onTouchMove_(ev) {
            const touch = ev.targetTouches.item(0);
            const rect = this.elem_.getBoundingClientRect();
            this.emitter.emit('move', {
                altKey: ev.altKey,
                data: this.computePosition_(touch
                    ? {
                        x: touch.clientX - rect.left,
                        y: touch.clientY - rect.top,
                    }
                    : undefined),
                sender: this,
                shiftKey: ev.shiftKey,
            });
            this.lastTouch_ = touch;
        }
        onTouchEnd_(ev) {
            var _a;
            const touch = (_a = ev.targetTouches.item(0)) !== null && _a !== void 0 ? _a : this.lastTouch_;
            const rect = this.elem_.getBoundingClientRect();
            this.emitter.emit('up', {
                altKey: ev.altKey,
                data: this.computePosition_(touch
                    ? {
                        x: touch.clientX - rect.left,
                        y: touch.clientY - rect.top,
                    }
                    : undefined),
                sender: this,
                shiftKey: ev.shiftKey,
            });
        }
    }

    function constrainRange(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    const className$4 = ClassName('txt');
    class NumberTextView {
        constructor(doc, config) {
            this.onChange_ = this.onChange_.bind(this);
            this.props_ = config.props;
            this.props_.emitter.on('change', this.onChange_);
            this.element = doc.createElement('div');
            this.element.classList.add(className$4(), className$4(undefined, 'num'));
            if (config.arrayPosition) {
                this.element.classList.add(className$4(undefined, config.arrayPosition));
            }
            config.viewProps.bindClassModifiers(this.element);
            const inputElem = doc.createElement('input');
            inputElem.classList.add(className$4('i'));
            inputElem.type = 'text';
            config.viewProps.bindDisabled(inputElem);
            this.element.appendChild(inputElem);
            this.inputElement = inputElem;
            this.onDraggingChange_ = this.onDraggingChange_.bind(this);
            this.dragging_ = config.dragging;
            this.dragging_.emitter.on('change', this.onDraggingChange_);
            this.element.classList.add(className$4());
            this.inputElement.classList.add(className$4('i'));
            const knobElem = doc.createElement('div');
            knobElem.classList.add(className$4('k'));
            this.element.appendChild(knobElem);
            this.knobElement = knobElem;
            const guideElem = doc.createElementNS(SVG_NS, 'svg');
            guideElem.classList.add(className$4('g'));
            this.knobElement.appendChild(guideElem);
            const bodyElem = doc.createElementNS(SVG_NS, 'path');
            bodyElem.classList.add(className$4('gb'));
            guideElem.appendChild(bodyElem);
            this.guideBodyElem_ = bodyElem;
            const headElem = doc.createElementNS(SVG_NS, 'path');
            headElem.classList.add(className$4('gh'));
            guideElem.appendChild(headElem);
            this.guideHeadElem_ = headElem;
            const tooltipElem = doc.createElement('div');
            tooltipElem.classList.add(ClassName('tt')());
            this.knobElement.appendChild(tooltipElem);
            this.tooltipElem_ = tooltipElem;
            config.value.emitter.on('change', this.onChange_);
            this.value = config.value;
            this.refresh();
        }
        onDraggingChange_(ev) {
            if (ev.rawValue === null) {
                this.element.classList.remove(className$4(undefined, 'drg'));
                return;
            }
            this.element.classList.add(className$4(undefined, 'drg'));
            const x = ev.rawValue / this.props_.get('draggingScale');
            const aox = x + (x > 0 ? -1 : x < 0 ? +1 : 0);
            const adx = constrainRange(-aox, -4, +4);
            this.guideHeadElem_.setAttributeNS(null, 'd', [`M ${aox + adx},0 L${aox},4 L${aox + adx},8`, `M ${x},-1 L${x},9`].join(' '));
            this.guideBodyElem_.setAttributeNS(null, 'd', `M 0,4 L${x},4`);
            const formatter = this.props_.get('formatter');
            this.tooltipElem_.textContent = formatter(this.value.rawValue);
            this.tooltipElem_.style.left = `${x}px`;
        }
        refresh() {
            const formatter = this.props_.get('formatter');
            this.inputElement.value = formatter(this.value.rawValue);
        }
        onChange_() {
            this.refresh();
        }
    }

    class NumberTextController {
        constructor(doc, config) {
            this.originRawValue_ = 0;
            this.onInputChange_ = this.onInputChange_.bind(this);
            this.onInputKeyDown_ = this.onInputKeyDown_.bind(this);
            this.onInputKeyUp_ = this.onInputKeyUp_.bind(this);
            this.onPointerDown_ = this.onPointerDown_.bind(this);
            this.onPointerMove_ = this.onPointerMove_.bind(this);
            this.onPointerUp_ = this.onPointerUp_.bind(this);
            this.baseStep_ = config.baseStep;
            this.parser_ = config.parser;
            this.props = config.props;
            this.value = config.value;
            this.viewProps = config.viewProps;
            this.dragging_ = createValue(null);
            this.view = new NumberTextView(doc, {
                arrayPosition: config.arrayPosition,
                dragging: this.dragging_,
                props: this.props,
                value: this.value,
                viewProps: this.viewProps,
            });
            this.view.inputElement.addEventListener('change', this.onInputChange_);
            this.view.inputElement.addEventListener('keydown', this.onInputKeyDown_);
            this.view.inputElement.addEventListener('keyup', this.onInputKeyUp_);
            const ph = new PointerHandler(this.view.knobElement);
            ph.emitter.on('down', this.onPointerDown_);
            ph.emitter.on('move', this.onPointerMove_);
            ph.emitter.on('up', this.onPointerUp_);
        }
        onInputChange_(e) {
            const inputElem = forceCast(e.currentTarget);
            const value = inputElem.value;
            const parsedValue = this.parser_(value);
            if (!isEmpty(parsedValue)) {
                this.value.rawValue = parsedValue;
            }
            this.view.refresh();
        }
        onInputKeyDown_(ev) {
            const step = getStepForKey(this.baseStep_, getVerticalStepKeys(ev));
            if (step === 0) {
                return;
            }
            this.value.setRawValue(this.value.rawValue + step, {
                forceEmit: false,
                last: false,
            });
        }
        onInputKeyUp_(ev) {
            const step = getStepForKey(this.baseStep_, getVerticalStepKeys(ev));
            if (step === 0) {
                return;
            }
            this.value.setRawValue(this.value.rawValue, {
                forceEmit: true,
                last: true,
            });
        }
        onPointerDown_() {
            this.originRawValue_ = this.value.rawValue;
            this.dragging_.rawValue = 0;
        }
        computeDraggingValue_(data) {
            if (!data.point) {
                return null;
            }
            const dx = data.point.x - data.bounds.width / 2;
            return this.originRawValue_ + dx * this.props.get('draggingScale');
        }
        onPointerMove_(ev) {
            const v = this.computeDraggingValue_(ev.data);
            if (v === null) {
                return;
            }
            this.value.setRawValue(v, {
                forceEmit: false,
                last: false,
            });
            this.dragging_.rawValue = this.value.rawValue - this.originRawValue_;
        }
        onPointerUp_(ev) {
            const v = this.computeDraggingValue_(ev.data);
            if (v === null) {
                return;
            }
            this.value.setRawValue(v, {
                forceEmit: true,
                last: true,
            });
            this.dragging_.rawValue = null;
        }
    }

    function parsePickerLayout(value) {
        if (value === 'inline' || value === 'popup') {
            return value;
        }
        return undefined;
    }
    function parsePointDimensionParams(value) {
        const p = ParamsParsers;
        return p.required.object({
            max: p.optional.number,
            min: p.optional.number,
            step: p.optional.number,
        })(value).value;
    }

    class PointNdConstraint {
        constructor(config) {
            this.components = config.components;
            this.asm_ = config.assembly;
        }
        constrain(value) {
            const comps = this.asm_
                .toComponents(value)
                .map((comp, index) => { var _a, _b; return (_b = (_a = this.components[index]) === null || _a === void 0 ? void 0 : _a.constrain(comp)) !== null && _b !== void 0 ? _b : comp; });
            return this.asm_.fromComponents(comps);
        }
    }

    const className$3 = ClassName('pndtxt');
    class PointNdTextView {
        constructor(doc, config) {
            this.textViews = config.textViews;
            this.element = doc.createElement('div');
            this.element.classList.add(className$3());
            this.textViews.forEach((v) => {
                const axisElem = doc.createElement('div');
                axisElem.classList.add(className$3('a'));
                axisElem.appendChild(v.element);
                this.element.appendChild(axisElem);
            });
        }
    }

    function createAxisController(doc, config, index) {
        return new NumberTextController(doc, {
            arrayPosition: index === 0 ? 'fst' : index === config.axes.length - 1 ? 'lst' : 'mid',
            baseStep: config.axes[index].baseStep,
            parser: config.parser,
            props: config.axes[index].textProps,
            value: createValue(0, {
                constraint: config.axes[index].constraint,
            }),
            viewProps: config.viewProps,
        });
    }
    class PointNdTextController {
        constructor(doc, config) {
            this.value = config.value;
            this.viewProps = config.viewProps;
            this.acs_ = config.axes.map((_, index) => createAxisController(doc, config, index));
            this.acs_.forEach((c, index) => {
                connectValues({
                    primary: this.value,
                    secondary: c.value,
                    forward: (p) => {
                        return config.assembly.toComponents(p.rawValue)[index];
                    },
                    backward: (p, s) => {
                        const comps = config.assembly.toComponents(p.rawValue);
                        comps[index] = s.rawValue;
                        return config.assembly.fromComponents(comps);
                    },
                });
            });
            this.view = new PointNdTextView(doc, {
                textViews: this.acs_.map((ac) => ac.view),
            });
        }
    }

    class Rotation {
        multiply(b) {
            return this.format(this.quat.multiply(b.quat));
        }
        premultiply(a) {
            return this.format(a.multiply(this));
        }
        slerp(b, t) {
            return this.format(this.quat.slerp(b.quat, t));
        }
    }

    function clamp(x, l, h) {
        return Math.min(Math.max(x, l), h);
    }

    function lofi(x, d) {
        return Math.floor(x / d) * d;
    }

    function mod(x, d) {
        return x - lofi(x, d);
    }

    function sanitizeAngle(angle) {
        return mod(angle + Math.PI, Math.PI * 2.0) - Math.PI;
    }

    class Euler extends Rotation {
        constructor(x, y, z, order, unit) {
            super();
            this.x = x !== null && x !== void 0 ? x : 0.0;
            this.y = y !== null && y !== void 0 ? y : 0.0;
            this.z = z !== null && z !== void 0 ? z : 0.0;
            this.order = order !== null && order !== void 0 ? order : 'XYZ';
            this.unit = unit !== null && unit !== void 0 ? unit : 'rad';
        }
        static fromQuaternion(quat, order, unit) {
            const m = quat.toMat3();
            const [i, j, k, sign] = order === 'XYZ' ? [0, 1, 2, 1] :
                order === 'XZY' ? [0, 2, 1, -1] :
                    order === 'YXZ' ? [1, 0, 2, -1] :
                        order === 'YZX' ? [1, 2, 0, 1] :
                            order === 'ZXY' ? [2, 0, 1, 1] :
                                [2, 1, 0, -1];
            const result = [0.0, 0.0, 0.0];
            const c = m[k + i * 3];
            result[j] = -sign * Math.asin(clamp(c, -1.0, 1.0));
            if (Math.abs(c) < 0.999999) {
                result[i] = sign * Math.atan2(m[k + j * 3], m[k * 4]);
                result[k] = sign * Math.atan2(m[j + i * 3], m[i * 4]);
            }
            else {
                // "y is 90deg" cases
                result[i] = sign * Math.atan2(-m[j + k * 3], m[j * 4]);
            }
            if (Math.abs(result[i]) + Math.abs(result[k]) > Math.PI) {
                // "two big revolutions" cases
                result[i] = sanitizeAngle(result[i] + Math.PI);
                result[j] = sanitizeAngle(Math.PI - result[j]);
                result[k] = sanitizeAngle(result[k] + Math.PI);
            }
            return new Euler(...result, order).reunit(unit);
        }
        get quat() {
            return Quaternion.fromEuler(this);
        }
        getComponents() {
            return [this.x, this.y, this.z];
        }
        toEuler(order, unit) {
            return this.reorder(order).reunit(unit);
        }
        format(r) {
            if (r instanceof Euler) {
                return r.reorder(this.order);
            }
            return r.toEuler(this.order, this.unit);
        }
        reorder(order) {
            if (order === this.order) {
                return this;
            }
            return this.quat.toEuler(order, this.unit);
        }
        reunit(unit) {
            const prev2Rad = {
                deg: Math.PI / 180.0,
                rad: 1.0,
                turn: 2.0 * Math.PI,
            }[this.unit];
            const rad2Next = {
                deg: 180.0 / Math.PI,
                rad: 1.0,
                turn: 0.5 / Math.PI,
            }[unit];
            const prev2Next = prev2Rad * rad2Next;
            return new Euler(prev2Next * this.x, prev2Next * this.y, prev2Next * this.z, this.order, unit);
        }
    }

    class Quaternion extends Rotation {
        constructor(x, y, z, w) {
            super();
            this.x = x !== null && x !== void 0 ? x : 0.0;
            this.y = y !== null && y !== void 0 ? y : 0.0;
            this.z = z !== null && z !== void 0 ? z : 0.0;
            this.w = w !== null && w !== void 0 ? w : 1.0;
        }
        static fromAxisAngle(axis, angle) {
            const halfAngle = angle / 2.0;
            const sinHalfAngle = Math.sin(halfAngle);
            return new Quaternion(axis.x * sinHalfAngle, axis.y * sinHalfAngle, axis.z * sinHalfAngle, Math.cos(halfAngle));
        }
        static fromEuler(eulerr) {
            const euler = eulerr.reunit('rad');
            const [i, j, k, sign] = euler.order === 'XYZ' ? [0, 1, 2, 1] :
                euler.order === 'XZY' ? [0, 2, 1, -1] :
                    euler.order === 'YXZ' ? [1, 0, 2, -1] :
                        euler.order === 'YZX' ? [1, 2, 0, 1] :
                            euler.order === 'ZXY' ? [2, 0, 1, 1] :
                                [2, 1, 0, -1];
            const compo = euler.getComponents();
            const ti = 0.5 * compo[i];
            const tj = 0.5 * sign * compo[j];
            const tk = 0.5 * compo[k];
            const ci = Math.cos(ti);
            const cj = Math.cos(tj);
            const ck = Math.cos(tk);
            const si = Math.sin(ti);
            const sj = Math.sin(tj);
            const sk = Math.sin(tk);
            const result = [
                0.0,
                0.0,
                0.0,
                ck * cj * ci + sk * sj * si,
            ];
            result[i] = ck * cj * si - sk * sj * ci;
            result[j] = sign * (ck * sj * ci + sk * cj * si);
            result[k] = sk * cj * ci - ck * sj * si;
            return new Quaternion(...result);
        }
        static lookRotation(look, up) {
            const { normal, tangent, binormal } = look.orthoNormalize(up);
            const m11 = binormal.x;
            const m12 = tangent.x;
            const m13 = normal.x;
            const m21 = binormal.y;
            const m22 = tangent.y;
            const m23 = normal.y;
            const m31 = binormal.z;
            const m32 = tangent.z;
            const m33 = normal.z;
            // Ref: https://github.com/mrdoob/three.js/blob/master/src/math/Quaternion.js
            // Ref: http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
            const trace = m11 + m22 + m33;
            if (trace > 0.0) {
                const s = 0.5 / Math.sqrt(trace + 1.0);
                return new Quaternion((m32 - m23) * s, (m13 - m31) * s, (m21 - m12) * s, 0.25 / s);
            }
            else if (m11 > m22 && m11 > m33) {
                const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);
                return new Quaternion(0.25 * s, (m12 + m21) / s, (m13 + m31) / s, (m32 - m23) / s);
            }
            else if (m22 > m33) {
                const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);
                return new Quaternion((m12 + m21) / s, 0.25 * s, (m23 + m32) / s, (m13 - m31) / s);
            }
            else {
                const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);
                return new Quaternion((m13 + m31) / s, (m23 + m32) / s, 0.25 * s, (m21 - m12) / s);
            }
        }
        get quat() {
            return this;
        }
        getComponents() {
            return [this.x, this.y, this.z, this.w];
        }
        toEuler(order, unit) {
            return Euler.fromQuaternion(this, order, unit);
        }
        get lengthSq() {
            return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
        }
        get length() {
            return Math.sqrt(this.lengthSq);
        }
        get normalized() {
            const l = this.length;
            if (l === 0.0) {
                return new Quaternion();
            }
            return new Quaternion(this.x / l, this.y / l, this.z / l, this.w / l);
        }
        get negated() {
            return new Quaternion(-this.x, -this.y, -this.z, -this.w);
        }
        get ban360s() {
            return (this.w < 0.0) ? this.negated : this;
        }
        multiply(br) {
            const b = br.quat;
            return new Quaternion(this.w * b.x + this.x * b.w + this.y * b.z - this.z * b.y, this.w * b.y - this.x * b.z + this.y * b.w + this.z * b.x, this.w * b.z + this.x * b.y - this.y * b.x + this.z * b.w, this.w * b.w - this.x * b.x - this.y * b.y - this.z * b.z);
        }
        format(r) {
            return r.quat;
        }
        slerp(br, t) {
            let b = br.quat;
            if (t === 0.0) {
                return this;
            }
            if (t === 1.0) {
                return b;
            }
            // Ref: https://github.com/mrdoob/three.js/blob/master/src/math/Quaternion.js
            // Ref: http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/
            const a = this.ban360s;
            b = b.ban360s;
            let cosHalfTheta = a.w * b.w + a.x * b.x + a.y * b.y + a.z * b.z;
            if (cosHalfTheta < 0.0) {
                b = b.negated;
                cosHalfTheta = -cosHalfTheta;
            }
            // I think you two are same
            if (cosHalfTheta >= 1.0) {
                return a;
            }
            const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;
            // fallback to simple lerp
            if (sqrSinHalfTheta <= Number.EPSILON) {
                const s = 1.0 - t;
                return new Quaternion(s * a.x + t * b.x, s * a.y + t * b.y, s * a.z + t * b.z, s * a.w + t * b.w).normalized;
            }
            // welcome
            const sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
            const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
            const ratioA = Math.sin((1.0 - t) * halfTheta) / sinHalfTheta;
            const ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
            return new Quaternion(a.x * ratioA + b.x * ratioB, a.y * ratioA + b.y * ratioB, a.z * ratioA + b.z * ratioB, a.w * ratioA + b.w * ratioB);
        }
        toMat3() {
            const { x, y, z, w } = this;
            return [
                1.0 - 2.0 * y * y - 2.0 * z * z, 2.0 * x * y + 2.0 * z * w, 2.0 * x * z - 2.0 * y * w,
                2.0 * x * y - 2.0 * z * w, 1.0 - 2.0 * x * x - 2.0 * z * z, 2.0 * y * z + 2.0 * x * w,
                2.0 * x * z + 2.0 * y * w, 2.0 * y * z - 2.0 * x * w, 1.0 - 2.0 * x * x - 2.0 * y * y,
            ];
        }
    }

    class PointProjector {
        constructor() {
            this.offset = [0.0, 0.0, -5.0];
            this.fov = 30.0;
            this.aspect = 1.0;
            this.viewport = [0, 0, 1, 1];
        }
        project(v) {
            const vcx = (this.viewport[0] + this.viewport[2]) * 0.5;
            const vcy = (this.viewport[1] + this.viewport[3]) * 0.5;
            const vw = (this.viewport[2] - this.viewport[0]);
            const vh = (this.viewport[3] - this.viewport[1]);
            const p = 1.0 / Math.tan(this.fov * Math.PI / 360.0);
            const sz = -(v.z + this.offset[2]);
            const sx = vcx + (v.x + this.offset[0]) / sz * p * vw * 0.5 / this.aspect;
            const sy = vcy - (v.y + this.offset[1]) / sz * p * vh * 0.5;
            return [sx, sy];
        }
    }

    class SVGLineStrip {
        constructor(doc, vertices, projector) {
            this.element = doc.createElementNS(SVG_NS, 'path');
            this.vertices = vertices;
            this.projector = projector;
        }
        /**
         * Make sure rotation is normalized!
         */
        setRotation(rotation) {
            let pathStr = '';
            this.vertices.forEach((vertex, iVertex) => {
                const transformed = vertex.applyQuaternion(rotation);
                const [sx, sy] = this.projector.project(transformed);
                const cmd = iVertex === 0 ? 'M' : 'L';
                pathStr += `${cmd}${sx} ${sy}`;
            });
            this.element.setAttributeNS(null, 'd', pathStr);
            return this;
        }
    }

    class Vector3 {
        constructor(x, y, z) {
            this.x = x !== null && x !== void 0 ? x : 0.0;
            this.y = y !== null && y !== void 0 ? y : 0.0;
            this.z = z !== null && z !== void 0 ? z : 0.0;
        }
        getComponents() {
            return [this.x, this.y, this.z];
        }
        get lengthSq() {
            return this.x * this.x + this.y * this.y + this.z * this.z;
        }
        get length() {
            return Math.sqrt(this.lengthSq);
        }
        get normalized() {
            const l = this.length;
            if (l === 0.0) {
                return new Vector3();
            }
            return new Vector3(this.x / l, this.y / l, this.z / l);
        }
        get negated() {
            return new Vector3(-this.x, -this.y, -this.z);
        }
        add(v) {
            return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
        }
        sub(v) {
            return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
        }
        scale(s) {
            return new Vector3(this.x * s, this.y * s, this.z * s);
        }
        dot(v) {
            return this.x * v.x + this.y * v.y + this.z * v.z;
        }
        cross(v) {
            return new Vector3(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x);
        }
        orthoNormalize(tangent) {
            const normal = this.normalized;
            tangent = tangent.normalized;
            let dotNT = normal.dot(tangent);
            if (dotNT === 1.0) {
                if (Math.abs(normal.y) > Math.abs(normal.z)) {
                    tangent = new Vector3(0.0, 0.0, 1.0);
                }
                else {
                    tangent = new Vector3(0.0, 1.0, 0.0);
                }
                dotNT = normal.dot(tangent);
            }
            tangent = tangent.sub(normal.scale(dotNT)).normalized;
            const binormal = tangent.cross(normal);
            return {
                normal,
                tangent,
                binormal,
            };
        }
        applyQuaternion(q) {
            const ix = q.w * this.x + q.y * this.z - q.z * this.y;
            const iy = q.w * this.y + q.z * this.x - q.x * this.z;
            const iz = q.w * this.z + q.x * this.y - q.y * this.x;
            const iw = -q.x * this.x - q.y * this.y - q.z * this.z;
            return new Vector3(ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y, iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z, iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x);
        }
    }

    function createArcRotation(axis, front) {
        const b = front.z > 0.0
            ? new Quaternion(0.0, 0.0, 0.0, 1.0)
            : new Quaternion(0.0, 0.0, 1.0, 0.0);
        if (Math.abs(axis.z) > 0.9999) {
            return b;
        }
        return Quaternion.lookRotation(axis, front);
    }

    function createArcVerticesArray(thetaStart, thetaLength, segments, cosAxis, sinAxis, radius = 1.0) {
        const vertices = [];
        for (let i = 0; i < segments; i++) {
            const t = thetaStart + thetaLength * i / (segments - 1);
            const vector = new Vector3();
            vector[cosAxis] = radius * Math.cos(t);
            vector[sinAxis] = radius * Math.sin(t);
            vertices.push(vector);
        }
        return vertices;
    }

    const className$2 = ClassName('rotationgizmo');
    const VEC3_ZERO = new Vector3(0.0, 0.0, 0.0);
    const VEC3_XP$2 = new Vector3(1.0, 0.0, 0.0);
    const VEC3_YP$2 = new Vector3(0.0, 1.0, 0.0);
    const VEC3_ZP$2 = new Vector3(0.0, 0.0, 1.0);
    const VEC3_ZN = new Vector3(0.0, 0.0, -1.0);
    const VEC3_XP70 = new Vector3(0.7, 0.0, 0.0);
    const VEC3_YP70 = new Vector3(0.0, 0.7, 0.0);
    const VEC3_ZP70 = new Vector3(0.0, 0.0, 0.7);
    const VEC3_XN70 = new Vector3(-0.7, 0.0, 0.0);
    const VEC3_YN70 = new Vector3(0.0, -0.7, 0.0);
    const VEC3_ZN70 = new Vector3(0.0, 0.0, -0.7);
    const QUAT_IDENTITY$2 = new Quaternion(0.0, 0.0, 0.0, 1.0);
    function createLabel(doc, circleClass, labelText) {
        const label = doc.createElementNS(SVG_NS, 'g');
        const circle = doc.createElementNS(SVG_NS, 'circle');
        circle.classList.add(className$2(circleClass));
        circle.setAttributeNS(null, 'cx', '0');
        circle.setAttributeNS(null, 'cy', '0');
        circle.setAttributeNS(null, 'r', '8');
        label.appendChild(circle);
        const text = doc.createElementNS(SVG_NS, 'text');
        text.classList.add(className$2('labeltext'));
        text.setAttributeNS(null, 'y', '4');
        text.setAttributeNS(null, 'text-anchor', 'middle');
        text.setAttributeNS(null, 'font-size', '10');
        text.textContent = labelText;
        label.appendChild(text);
        return label;
    }
    class RotationInputGizmoView {
        constructor(doc, config) {
            this.onFoldableChange_ = this.onFoldableChange_.bind(this);
            this.onValueChange_ = this.onValueChange_.bind(this);
            this.onModeChange_ = this.onModeChange_.bind(this);
            this.element = doc.createElement('div');
            this.element.classList.add(className$2());
            if (config.pickerLayout === 'popup') {
                this.element.classList.add(className$2(undefined, 'p'));
            }
            const padElem = doc.createElement('div');
            padElem.classList.add(className$2('p'));
            config.viewProps.bindTabIndex(padElem);
            this.element.appendChild(padElem);
            this.padElement = padElem;
            const svgElem = doc.createElementNS(SVG_NS, 'svg');
            svgElem.classList.add(className$2('g'));
            this.padElement.appendChild(svgElem);
            this.svgElem_ = svgElem;
            this.projector_ = new PointProjector();
            this.projector_.viewport = [0, 0, 136, 136];
            const arcArray = createArcVerticesArray(0.0, Math.PI, 33, 'x', 'y');
            const arcArrayR = createArcVerticesArray(0.0, 2.0 * Math.PI, 65, 'x', 'y', 1.1);
            // back arc
            this.xArcB_ = new SVGLineStrip(doc, arcArray, this.projector_);
            this.xArcB_.element.classList.add(className$2('arcx'));
            this.svgElem_.appendChild(this.xArcB_.element);
            this.yArcB_ = new SVGLineStrip(doc, arcArray, this.projector_);
            this.yArcB_.element.classList.add(className$2('arcy'));
            this.svgElem_.appendChild(this.yArcB_.element);
            this.zArcB_ = new SVGLineStrip(doc, arcArray, this.projector_);
            this.zArcB_.element.classList.add(className$2('arcz'));
            this.svgElem_.appendChild(this.zArcB_.element);
            this.xArcBC_ = new SVGLineStrip(doc, arcArray, this.projector_);
            this.xArcBC_.element.classList.add(className$2('arcc'));
            this.svgElem_.appendChild(this.xArcBC_.element);
            this.yArcBC_ = new SVGLineStrip(doc, arcArray, this.projector_);
            this.yArcBC_.element.classList.add(className$2('arcc'));
            this.svgElem_.appendChild(this.yArcBC_.element);
            this.zArcBC_ = new SVGLineStrip(doc, arcArray, this.projector_);
            this.zArcBC_.element.classList.add(className$2('arcc'));
            this.svgElem_.appendChild(this.zArcBC_.element);
            // axes
            const axesElem = doc.createElementNS(SVG_NS, 'g');
            svgElem.classList.add(className$2('axes'));
            this.svgElem_.appendChild(axesElem);
            this.axesElem_ = axesElem;
            this.xAxis_ = new SVGLineStrip(doc, [VEC3_ZERO, VEC3_XP70], this.projector_);
            this.xAxis_.element.classList.add(className$2('axisx'));
            this.axesElem_.appendChild(this.xAxis_.element);
            this.yAxis_ = new SVGLineStrip(doc, [VEC3_ZERO, VEC3_YP70], this.projector_);
            this.yAxis_.element.classList.add(className$2('axisy'));
            this.axesElem_.appendChild(this.yAxis_.element);
            this.zAxis_ = new SVGLineStrip(doc, [VEC3_ZERO, VEC3_ZP70], this.projector_);
            this.zAxis_.element.classList.add(className$2('axisz'));
            this.axesElem_.appendChild(this.zAxis_.element);
            this.xnAxis_ = new SVGLineStrip(doc, [VEC3_ZERO, VEC3_XN70], this.projector_);
            this.xnAxis_.element.classList.add(className$2('axisn'));
            this.axesElem_.appendChild(this.xnAxis_.element);
            this.ynAxis_ = new SVGLineStrip(doc, [VEC3_ZERO, VEC3_YN70], this.projector_);
            this.ynAxis_.element.classList.add(className$2('axisn'));
            this.axesElem_.appendChild(this.ynAxis_.element);
            this.znAxis_ = new SVGLineStrip(doc, [VEC3_ZERO, VEC3_ZN70], this.projector_);
            this.znAxis_.element.classList.add(className$2('axisn'));
            this.axesElem_.appendChild(this.znAxis_.element);
            // front arc
            this.xArcF_ = new SVGLineStrip(doc, arcArray, this.projector_);
            this.xArcF_.element.classList.add(className$2('arcx'));
            this.svgElem_.appendChild(this.xArcF_.element);
            this.yArcF_ = new SVGLineStrip(doc, arcArray, this.projector_);
            this.yArcF_.element.classList.add(className$2('arcy'));
            this.svgElem_.appendChild(this.yArcF_.element);
            this.zArcF_ = new SVGLineStrip(doc, arcArray, this.projector_);
            this.zArcF_.element.classList.add(className$2('arcz'));
            this.svgElem_.appendChild(this.zArcF_.element);
            this.xArcFC_ = new SVGLineStrip(doc, arcArray, this.projector_);
            this.xArcFC_.element.classList.add(className$2('arcc'));
            this.svgElem_.appendChild(this.xArcFC_.element);
            this.yArcFC_ = new SVGLineStrip(doc, arcArray, this.projector_);
            this.yArcFC_.element.classList.add(className$2('arcc'));
            this.svgElem_.appendChild(this.yArcFC_.element);
            this.zArcFC_ = new SVGLineStrip(doc, arcArray, this.projector_);
            this.zArcFC_.element.classList.add(className$2('arcc'));
            this.svgElem_.appendChild(this.zArcFC_.element);
            // roll arc
            this.rArc_ = new SVGLineStrip(doc, arcArrayR, this.projector_);
            this.rArc_.element.classList.add(className$2('arcr'));
            this.rArc_.setRotation(QUAT_IDENTITY$2);
            this.svgElem_.appendChild(this.rArc_.element);
            this.rArcC_ = new SVGLineStrip(doc, arcArrayR, this.projector_);
            this.rArcC_.element.classList.add(className$2('arcc'));
            this.rArcC_.setRotation(QUAT_IDENTITY$2);
            this.svgElem_.appendChild(this.rArcC_.element);
            // labels
            const labelsElem = doc.createElementNS(SVG_NS, 'g');
            svgElem.classList.add(className$2('labels'));
            this.svgElem_.appendChild(labelsElem);
            this.labelsElem_ = labelsElem;
            this.xLabel = createLabel(doc, 'labelcirclex', 'X');
            this.labelsElem_.appendChild(this.xLabel);
            this.yLabel = createLabel(doc, 'labelcircley', 'Y');
            this.labelsElem_.appendChild(this.yLabel);
            this.zLabel = createLabel(doc, 'labelcirclez', 'Z');
            this.labelsElem_.appendChild(this.zLabel);
            this.xnLabel = createLabel(doc, 'labelcirclen', '-X');
            this.labelsElem_.appendChild(this.xnLabel);
            this.ynLabel = createLabel(doc, 'labelcirclen', '-Y');
            this.labelsElem_.appendChild(this.ynLabel);
            this.znLabel = createLabel(doc, 'labelcirclen', '-Z');
            this.labelsElem_.appendChild(this.znLabel);
            // arc hover
            const onHoverXArc = () => {
                this.xArcB_.element.classList.add(className$2('arcx_hover'));
                this.xArcF_.element.classList.add(className$2('arcx_hover'));
            };
            const onLeaveXArc = () => {
                this.xArcB_.element.classList.remove(className$2('arcx_hover'));
                this.xArcF_.element.classList.remove(className$2('arcx_hover'));
            };
            this.xArcBC_.element.addEventListener('mouseenter', onHoverXArc);
            this.xArcBC_.element.addEventListener('mouseleave', onLeaveXArc);
            this.xArcFC_.element.addEventListener('mouseenter', onHoverXArc);
            this.xArcFC_.element.addEventListener('mouseleave', onLeaveXArc);
            const onHoverYArc = () => {
                this.yArcB_.element.classList.add(className$2('arcy_hover'));
                this.yArcF_.element.classList.add(className$2('arcy_hover'));
            };
            const onLeaveYArc = () => {
                this.yArcB_.element.classList.remove(className$2('arcy_hover'));
                this.yArcF_.element.classList.remove(className$2('arcy_hover'));
            };
            this.yArcBC_.element.addEventListener('mouseenter', onHoverYArc);
            this.yArcBC_.element.addEventListener('mouseleave', onLeaveYArc);
            this.yArcFC_.element.addEventListener('mouseenter', onHoverYArc);
            this.yArcFC_.element.addEventListener('mouseleave', onLeaveYArc);
            const onHoverZArc = () => {
                this.zArcB_.element.classList.add(className$2('arcz_hover'));
                this.zArcF_.element.classList.add(className$2('arcz_hover'));
            };
            const onLeaveZArc = () => {
                this.zArcB_.element.classList.remove(className$2('arcz_hover'));
                this.zArcF_.element.classList.remove(className$2('arcz_hover'));
            };
            this.zArcBC_.element.addEventListener('mouseenter', onHoverZArc);
            this.zArcBC_.element.addEventListener('mouseleave', onLeaveZArc);
            this.zArcFC_.element.addEventListener('mouseenter', onHoverZArc);
            this.zArcFC_.element.addEventListener('mouseleave', onLeaveZArc);
            const onHoverRArc = () => {
                this.rArc_.element.classList.add(className$2('arcr_hover'));
            };
            const onLeaveRArc = () => {
                this.rArc_.element.classList.remove(className$2('arcr_hover'));
            };
            this.rArcC_.element.addEventListener('mouseenter', onHoverRArc);
            this.rArcC_.element.addEventListener('mouseleave', onLeaveRArc);
            config.value.emitter.on('change', this.onValueChange_);
            this.value = config.value;
            config.mode.emitter.on('change', this.onModeChange_);
            this.mode_ = config.mode;
            this.update_();
        }
        get xArcBElement() { return this.xArcBC_.element; }
        get yArcBElement() { return this.yArcBC_.element; }
        get zArcBElement() { return this.zArcBC_.element; }
        get xArcFElement() { return this.xArcFC_.element; }
        get yArcFElement() { return this.yArcFC_.element; }
        get zArcFElement() { return this.zArcFC_.element; }
        get rArcElement() { return this.rArcC_.element; }
        get allFocusableElements() {
            return [this.padElement];
        }
        update_() {
            const q = this.value.rawValue.quat.normalized;
            // rotate axes
            this.xAxis_.setRotation(q);
            this.yAxis_.setRotation(q);
            this.zAxis_.setRotation(q);
            this.xnAxis_.setRotation(q);
            this.ynAxis_.setRotation(q);
            this.znAxis_.setRotation(q);
            // """z-sort""" axes
            const xp = VEC3_XP$2.applyQuaternion(q);
            const yp = VEC3_YP$2.applyQuaternion(q);
            const zp = VEC3_ZP$2.applyQuaternion(q);
            const xn = xp.negated;
            const yn = yp.negated;
            const zn = zp.negated;
            [
                { el: this.xAxis_.element, v: xp },
                { el: this.yAxis_.element, v: yp },
                { el: this.zAxis_.element, v: zp },
                { el: this.xnAxis_.element, v: xn },
                { el: this.ynAxis_.element, v: yn },
                { el: this.znAxis_.element, v: zn },
            ]
                .map(({ el, v }) => {
                this.axesElem_.removeChild(el);
                return { el, v };
            })
                .sort((a, b) => a.v.z - b.v.z)
                .forEach(({ el }) => {
                this.axesElem_.appendChild(el);
            });
            // rotate arcs
            this.xArcB_.setRotation(createArcRotation(xp, VEC3_ZN));
            this.yArcB_.setRotation(createArcRotation(yp, VEC3_ZN));
            this.zArcB_.setRotation(createArcRotation(zp, VEC3_ZN));
            this.xArcBC_.setRotation(createArcRotation(xp, VEC3_ZN));
            this.yArcBC_.setRotation(createArcRotation(yp, VEC3_ZN));
            this.zArcBC_.setRotation(createArcRotation(zp, VEC3_ZN));
            this.xArcF_.setRotation(createArcRotation(xp, VEC3_ZP$2));
            this.yArcF_.setRotation(createArcRotation(yp, VEC3_ZP$2));
            this.zArcF_.setRotation(createArcRotation(zp, VEC3_ZP$2));
            this.xArcFC_.setRotation(createArcRotation(xp, VEC3_ZP$2));
            this.yArcFC_.setRotation(createArcRotation(yp, VEC3_ZP$2));
            this.zArcFC_.setRotation(createArcRotation(zp, VEC3_ZP$2));
            // rotate labels
            [
                { el: this.xLabel, v: VEC3_XP70 },
                { el: this.yLabel, v: VEC3_YP70 },
                { el: this.zLabel, v: VEC3_ZP70 },
                { el: this.xnLabel, v: VEC3_XN70 },
                { el: this.ynLabel, v: VEC3_YN70 },
                { el: this.znLabel, v: VEC3_ZN70 },
            ].forEach(({ el, v }) => {
                const [x, y] = this.projector_.project(v.applyQuaternion(q));
                el.setAttributeNS(null, 'transform', `translate( ${x}, ${y} )`);
            });
            // """z-sort""" labels
            [
                { el: this.xLabel, v: xp },
                { el: this.yLabel, v: yp },
                { el: this.zLabel, v: zp },
                { el: this.xnLabel, v: xn },
                { el: this.ynLabel, v: yn },
                { el: this.znLabel, v: zn },
            ].map(({ el, v }) => {
                this.labelsElem_.removeChild(el);
                return { el, v };
            })
                .sort((a, b) => a.v.z - b.v.z)
                .forEach(({ el }) => {
                this.labelsElem_.appendChild(el);
            });
        }
        onValueChange_() {
            this.update_();
        }
        onFoldableChange_() {
            this.update_();
        }
        onModeChange_() {
            const mode = this.mode_.rawValue;
            const x = mode === 'angle-x' ? 'add' : 'remove';
            const y = mode === 'angle-y' ? 'add' : 'remove';
            const z = mode === 'angle-z' ? 'add' : 'remove';
            const r = mode === 'angle-r' ? 'add' : 'remove';
            this.xArcB_.element.classList[x](className$2('arcx_active'));
            this.yArcB_.element.classList[y](className$2('arcy_active'));
            this.zArcB_.element.classList[z](className$2('arcz_active'));
            this.xArcF_.element.classList[x](className$2('arcx_active'));
            this.yArcF_.element.classList[y](className$2('arcy_active'));
            this.zArcF_.element.classList[z](className$2('arcz_active'));
            this.rArc_.element.classList[r](className$2('arcr_active'));
        }
    }

    function saturate(x) {
        return clamp(x, 0.0, 1.0);
    }

    /**
     * hand-picked random polynomial that looks cool
     * clamped in [0.0 - 1.0]
     */
    function iikanjiEaseout(x) {
        if (x <= 0.0) {
            return 0.0;
        }
        if (x >= 1.0) {
            return 1.0;
        }
        const xt = 1.0 - x;
        const y = xt * (xt * (xt * (xt * (xt * (xt * (xt * (-6) + 7))))));
        return saturate(1.0 - y);
    }

    function linearstep(a, b, x) {
        return saturate((x - a) / (b - a));
    }

    const INV_SQRT2 = 1.0 / Math.sqrt(2.0);
    const VEC3_XP$1 = new Vector3(1.0, 0.0, 0.0);
    const VEC3_YP$1 = new Vector3(0.0, 1.0, 0.0);
    const VEC3_ZP$1 = new Vector3(0.0, 0.0, 1.0);
    const QUAT_IDENTITY$1 = new Quaternion(0.0, 0.0, 0.0, 1.0);
    const QUAT_TOP = new Quaternion(INV_SQRT2, 0.0, 0.0, INV_SQRT2);
    const QUAT_RIGHT = new Quaternion(0.0, -INV_SQRT2, 0.0, INV_SQRT2);
    const QUAT_BOTTOM = new Quaternion(-INV_SQRT2, 0.0, 0.0, INV_SQRT2);
    const QUAT_LEFT = new Quaternion(0.0, INV_SQRT2, 0.0, INV_SQRT2);
    const QUAT_BACK = new Quaternion(0.0, 1.0, 0.0, 0.0);
    class RotationInputGizmoController {
        constructor(doc, config) {
            this.onPadKeyDown_ = this.onPadKeyDown_.bind(this);
            this.onPointerDown_ = this.onPointerDown_.bind(this);
            this.onPointerMove_ = this.onPointerMove_.bind(this);
            this.onPointerUp_ = this.onPointerUp_.bind(this);
            this.value = config.value;
            this.viewProps = config.viewProps;
            this.mode_ = createValue('free');
            this.view = new RotationInputGizmoView(doc, {
                value: this.value,
                mode: this.mode_,
                viewProps: this.viewProps,
                pickerLayout: config.pickerLayout,
            });
            this.ptHandler_ = new PointerHandler(this.view.padElement);
            this.ptHandler_.emitter.on('down', this.onPointerDown_);
            this.ptHandler_.emitter.on('move', this.onPointerMove_);
            this.ptHandler_.emitter.on('up', this.onPointerUp_);
            this.view.padElement.addEventListener('keydown', this.onPadKeyDown_);
            const ptHandlerXArcB = new PointerHandler(this.view.xArcBElement);
            ptHandlerXArcB.emitter.on('down', () => this.changeModeIfNotAuto_('angle-x'));
            ptHandlerXArcB.emitter.on('up', () => this.changeModeIfNotAuto_('free'));
            const ptHandlerXArcF = new PointerHandler(this.view.xArcFElement);
            ptHandlerXArcF.emitter.on('down', () => this.changeModeIfNotAuto_('angle-x'));
            ptHandlerXArcF.emitter.on('up', () => this.changeModeIfNotAuto_('free'));
            const ptHandlerYArcB = new PointerHandler(this.view.yArcBElement);
            ptHandlerYArcB.emitter.on('down', () => this.changeModeIfNotAuto_('angle-y'));
            ptHandlerYArcB.emitter.on('up', () => this.changeModeIfNotAuto_('free'));
            const ptHandlerYArcF = new PointerHandler(this.view.yArcFElement);
            ptHandlerYArcF.emitter.on('down', () => this.changeModeIfNotAuto_('angle-y'));
            ptHandlerYArcF.emitter.on('up', () => this.changeModeIfNotAuto_('free'));
            const ptHandlerZArcB = new PointerHandler(this.view.zArcBElement);
            ptHandlerZArcB.emitter.on('down', () => this.changeModeIfNotAuto_('angle-z'));
            ptHandlerZArcB.emitter.on('up', () => this.changeModeIfNotAuto_('free'));
            const ptHandlerZArcF = new PointerHandler(this.view.zArcFElement);
            ptHandlerZArcF.emitter.on('down', () => this.changeModeIfNotAuto_('angle-z'));
            ptHandlerZArcF.emitter.on('up', () => this.changeModeIfNotAuto_('free'));
            const ptHandlerRArc = new PointerHandler(this.view.rArcElement);
            ptHandlerRArc.emitter.on('down', () => this.changeModeIfNotAuto_('angle-r'));
            ptHandlerRArc.emitter.on('up', () => this.changeModeIfNotAuto_('free'));
            [
                { el: this.view.xLabel, q: QUAT_RIGHT },
                { el: this.view.yLabel, q: QUAT_TOP },
                { el: this.view.zLabel, q: QUAT_IDENTITY$1 },
                { el: this.view.xnLabel, q: QUAT_LEFT },
                { el: this.view.ynLabel, q: QUAT_BOTTOM },
                { el: this.view.znLabel, q: QUAT_BACK },
            ].forEach(({ el, q }) => {
                const ptHandler = new PointerHandler(el);
                ptHandler.emitter.on('down', () => this.autoRotate_(q));
            });
            this.px_ = null;
            this.py_ = null;
            this.angleState_ = null;
        }
        handlePointerEvent_(d) {
            if (!d.point) {
                return;
            }
            const mode = this.mode_.rawValue;
            const x = d.point.x;
            const y = d.point.y;
            if (mode === 'auto') ;
            else if (mode === 'free') {
                if (this.px_ != null && this.py_ != null) {
                    const dx = x - this.px_;
                    const dy = y - this.py_;
                    const l = Math.sqrt(dx * dx + dy * dy);
                    if (l === 0.0) {
                        return;
                    }
                    const axis = new Vector3(dy / l, dx / l, 0.0);
                    const quat = Quaternion.fromAxisAngle(axis, l / 68.0);
                    this.value.rawValue = this.value.rawValue.premultiply(quat);
                }
                this.px_ = x;
                this.py_ = y;
            }
            else if (mode === 'angle-r') {
                const cx = d.bounds.width / 2.0;
                const cy = d.bounds.height / 2.0;
                const angle = Math.atan2(y - cy, x - cx);
                if (this.angleState_ == null) {
                    const axis = new Vector3(0.0, 0.0, 1.0);
                    this.angleState_ = {
                        initialRotation: this.value.rawValue,
                        initialAngle: angle,
                        axis,
                        reverseAngle: true,
                    };
                }
                else {
                    const { initialRotation, initialAngle, axis } = this.angleState_;
                    const angleDiff = -sanitizeAngle(angle - initialAngle);
                    const quat = Quaternion.fromAxisAngle(axis, angleDiff);
                    this.value.rawValue = initialRotation.premultiply(quat);
                }
            }
            else {
                const cx = d.bounds.width / 2.0;
                const cy = d.bounds.height / 2.0;
                const angle = Math.atan2(y - cy, x - cx);
                if (this.angleState_ == null) {
                    const axis = mode === 'angle-x' ? VEC3_XP$1 :
                        mode === 'angle-y' ? VEC3_YP$1 :
                            VEC3_ZP$1;
                    const reverseAngle = axis.applyQuaternion(this.value.rawValue.quat).z > 0.0;
                    this.angleState_ = {
                        initialRotation: this.value.rawValue,
                        initialAngle: angle,
                        axis,
                        reverseAngle,
                    };
                }
                else {
                    const { initialRotation, initialAngle, axis, reverseAngle } = this.angleState_;
                    let angleDiff = sanitizeAngle(angle - initialAngle);
                    angleDiff = reverseAngle ? -angleDiff : angleDiff;
                    const quat = Quaternion.fromAxisAngle(axis, angleDiff);
                    this.value.rawValue = initialRotation.multiply(quat);
                }
            }
        }
        onPointerDown_(ev) {
            this.handlePointerEvent_(ev.data);
        }
        onPointerMove_(ev) {
            this.handlePointerEvent_(ev.data);
        }
        onPointerUp_() {
            this.px_ = null;
            this.py_ = null;
            this.angleState_ = null;
        }
        onPadKeyDown_(ev) {
            if (isArrowKey(ev.key)) {
                ev.preventDefault();
            }
            const x = getStepForKey(1.0, getHorizontalStepKeys(ev));
            const y = getStepForKey(1.0, getVerticalStepKeys(ev));
            if (x !== 0 || y !== 0) {
                const axis = new Vector3(-y, x, 0.0);
                const quat = Quaternion.fromAxisAngle(axis, Math.PI / 16.0);
                this.value.rawValue = this.value.rawValue.premultiply(quat);
            }
        }
        changeModeIfNotAuto_(mode) {
            if (this.mode_.rawValue !== 'auto') {
                this.mode_.rawValue = mode;
            }
        }
        autoRotate_(to) {
            this.mode_.rawValue = 'auto';
            const from = this.value.rawValue;
            const beginTime = Date.now();
            const update = () => {
                const now = Date.now();
                const t = iikanjiEaseout(linearstep(0.0, 300.0, now - beginTime));
                this.value.rawValue = from.slerp(to, t);
                if (t === 1.0) {
                    this.mode_.rawValue = 'free';
                    return;
                }
                requestAnimationFrame(update);
            };
            requestAnimationFrame(update);
        }
    }

    const className$1 = ClassName('rotationswatch');
    const VEC3_XP = new Vector3(1.0, 0.0, 0.0);
    const VEC3_YP = new Vector3(0.0, 1.0, 0.0);
    const VEC3_ZP = new Vector3(0.0, 0.0, 1.0);
    const QUAT_IDENTITY = new Quaternion(0.0, 0.0, 0.0, 1.0);
    class RotationInputSwatchView {
        constructor(doc, config) {
            this.onValueChange_ = this.onValueChange_.bind(this);
            config.value.emitter.on('change', this.onValueChange_);
            this.value = config.value;
            this.element = doc.createElement('div');
            this.element.classList.add(className$1());
            config.viewProps.bindClassModifiers(this.element);
            const buttonElem = doc.createElement('button');
            buttonElem.classList.add(className$1('b'));
            config.viewProps.bindDisabled(buttonElem);
            this.element.appendChild(buttonElem);
            this.buttonElement = buttonElem;
            const svgElem = doc.createElementNS(SVG_NS, 'svg');
            svgElem.classList.add(className$1('g'));
            buttonElem.appendChild(svgElem);
            this.svgElem_ = svgElem;
            this.projector_ = new PointProjector();
            this.projector_.viewport = [0, 0, 20, 20];
            const arcArray = createArcVerticesArray(0.0, Math.PI, 33, 'x', 'y');
            const arcArrayR = createArcVerticesArray(0.0, 2.0 * Math.PI, 65, 'x', 'y');
            // arc
            this.rArc_ = new SVGLineStrip(doc, arcArrayR, this.projector_);
            this.rArc_.element.classList.add(className$1('arcr'));
            svgElem.appendChild(this.rArc_.element);
            this.rArc_.setRotation(QUAT_IDENTITY);
            this.xArc_ = new SVGLineStrip(doc, arcArray, this.projector_);
            this.xArc_.element.classList.add(className$1('arc'));
            svgElem.appendChild(this.xArc_.element);
            this.yArc_ = new SVGLineStrip(doc, arcArray, this.projector_);
            this.yArc_.element.classList.add(className$1('arc'));
            svgElem.appendChild(this.yArc_.element);
            this.zArc_ = new SVGLineStrip(doc, arcArray, this.projector_);
            this.zArc_.element.classList.add(className$1('arc'));
            svgElem.appendChild(this.zArc_.element);
            this.update_();
        }
        update_() {
            const q = this.value.rawValue.quat.normalized;
            // rotate axes
            const xp = VEC3_XP.applyQuaternion(q);
            const yp = VEC3_YP.applyQuaternion(q);
            const zp = VEC3_ZP.applyQuaternion(q);
            this.xArc_.setRotation(createArcRotation(xp, VEC3_ZP));
            this.yArc_.setRotation(createArcRotation(yp, VEC3_ZP));
            this.zArc_.setRotation(createArcRotation(zp, VEC3_ZP));
        }
        onValueChange_() {
            this.update_();
        }
    }

    class RotationInputSwatchController {
        constructor(doc, config) {
            this.value = config.value;
            this.viewProps = config.viewProps;
            this.view = new RotationInputSwatchView(doc, {
                value: this.value,
                viewProps: this.viewProps,
            });
        }
    }

    const className = ClassName('rotation');
    class RotationInputView {
        constructor(doc, config) {
            this.element = doc.createElement('div');
            this.element.classList.add(className());
            config.foldable.bindExpandedClass(this.element, className(undefined, 'expanded'));
            bindValueMap(config.foldable, 'completed', valueToClassName(this.element, className(undefined, 'cpl')));
            if (config.rotationMode === 'quaternion') {
                this.element.classList.add(className('quat'));
            }
            const headElem = doc.createElement('div');
            headElem.classList.add(className('h'));
            this.element.appendChild(headElem);
            const swatchElem = doc.createElement('div');
            swatchElem.classList.add(className('s'));
            headElem.appendChild(swatchElem);
            this.swatchElement = swatchElem;
            const textElem = doc.createElement('div');
            textElem.classList.add(className('t'));
            headElem.appendChild(textElem);
            this.textElement = textElem;
            if (config.pickerLayout === 'inline') {
                const pickerElem = doc.createElement('div');
                pickerElem.classList.add(className('g'));
                this.element.appendChild(pickerElem);
                this.pickerElement = pickerElem;
            }
            else {
                this.pickerElement = null;
            }
        }
    }

    class RotationInputController {
        constructor(doc, config) {
            this.onButtonBlur_ = this.onButtonBlur_.bind(this);
            this.onButtonClick_ = this.onButtonClick_.bind(this);
            this.onPopupChildBlur_ = this.onPopupChildBlur_.bind(this);
            this.onPopupChildKeydown_ = this.onPopupChildKeydown_.bind(this);
            this.value = config.value;
            this.viewProps = config.viewProps;
            this.foldable_ = Foldable.create(config.expanded);
            this.swatchC_ = new RotationInputSwatchController(doc, {
                value: this.value,
                viewProps: this.viewProps,
            });
            const buttonElem = this.swatchC_.view.buttonElement;
            buttonElem.addEventListener('blur', this.onButtonBlur_);
            buttonElem.addEventListener('click', this.onButtonClick_);
            this.textC_ = new PointNdTextController(doc, {
                assembly: config.assembly,
                axes: config.axes,
                parser: config.parser,
                value: this.value,
                viewProps: this.viewProps,
            });
            this.view = new RotationInputView(doc, {
                rotationMode: config.rotationMode,
                foldable: this.foldable_,
                pickerLayout: config.pickerLayout,
            });
            this.view.swatchElement.appendChild(this.swatchC_.view.element);
            this.view.textElement.appendChild(this.textC_.view.element);
            this.popC_ =
                config.pickerLayout === 'popup'
                    ? new PopupController(doc, {
                        viewProps: this.viewProps,
                    })
                    : null;
            const gizmoC = new RotationInputGizmoController(doc, {
                value: this.value,
                viewProps: this.viewProps,
                pickerLayout: config.pickerLayout,
            });
            gizmoC.view.allFocusableElements.forEach((elem) => {
                elem.addEventListener('blur', this.onPopupChildBlur_);
                elem.addEventListener('keydown', this.onPopupChildKeydown_);
            });
            this.gizmoC_ = gizmoC;
            if (this.popC_) {
                this.view.element.appendChild(this.popC_.view.element);
                this.popC_.view.element.appendChild(gizmoC.view.element);
                connectValues({
                    primary: this.foldable_.value('expanded'),
                    secondary: this.popC_.shows,
                    forward: (p) => p.rawValue,
                    backward: (_, s) => s.rawValue,
                });
            }
            else if (this.view.pickerElement) {
                this.view.pickerElement.appendChild(this.gizmoC_.view.element);
                bindFoldable(this.foldable_, this.view.pickerElement);
            }
        }
        onButtonBlur_(e) {
            if (!this.popC_) {
                return;
            }
            const elem = this.view.element;
            const nextTarget = forceCast(e.relatedTarget);
            if (!nextTarget || !elem.contains(nextTarget)) {
                this.popC_.shows.rawValue = false;
            }
        }
        onButtonClick_() {
            this.foldable_.set('expanded', !this.foldable_.get('expanded'));
            if (this.foldable_.get('expanded')) {
                this.gizmoC_.view.allFocusableElements[0].focus();
            }
        }
        onPopupChildBlur_(ev) {
            if (!this.popC_) {
                return;
            }
            const elem = this.popC_.view.element;
            const nextTarget = findNextTarget(ev);
            if (nextTarget && elem.contains(nextTarget)) {
                // Next target is in the picker
                return;
            }
            if (nextTarget &&
                nextTarget === this.swatchC_.view.buttonElement &&
                !supportsTouch(elem.ownerDocument)) {
                // Next target is the trigger button
                return;
            }
            this.popC_.shows.rawValue = false;
        }
        onPopupChildKeydown_(ev) {
            if (this.popC_) {
                if (ev.key === 'Escape') {
                    this.popC_.shows.rawValue = false;
                }
            }
            else if (this.view.pickerElement) {
                if (ev.key === 'Escape') {
                    this.swatchC_.view.buttonElement.focus();
                }
            }
        }
    }

    function createAxisEuler(digits, constraint) {
        const step = Math.pow(0.1, digits);
        return {
            baseStep: step,
            constraint: constraint,
            textProps: ValueMap.fromObject({
                draggingScale: step,
                formatter: createNumberFormatter(digits),
            }),
        };
    }

    function createDimensionConstraint(params) {
        if (!params) {
            return undefined;
        }
        const constraints = [];
        if (!isEmpty(params.step)) {
            constraints.push(new StepConstraint(params.step));
        }
        if (!isEmpty(params.max) || !isEmpty(params.min)) {
            constraints.push(new RangeConstraint({
                max: params.max,
                min: params.min,
            }));
        }
        return new CompositeConstraint(constraints);
    }

    function createEulerAssembly(order, unit) {
        return {
            toComponents: (r) => r.getComponents(),
            fromComponents: (c) => new Euler(c[0], c[1], c[2], order, unit),
        };
    }

    function parseEuler(exValue, order, unit) {
        var _a, _b, _c;
        if (typeof ((_a = exValue) === null || _a === void 0 ? void 0 : _a.x) === 'number' &&
            typeof ((_b = exValue) === null || _b === void 0 ? void 0 : _b.y) === 'number' &&
            typeof ((_c = exValue) === null || _c === void 0 ? void 0 : _c.z) === 'number') {
            return new Euler(exValue.x, exValue.y, exValue.z, order, unit);
        }
        else {
            return new Euler(0.0, 0.0, 0.0, order, unit);
        }
    }

    function parseEulerOrder(value) {
        switch (value) {
            case 'XYZ':
            case 'XZY':
            case 'YXZ':
            case 'YZX':
            case 'ZXY':
            case 'ZYX':
                return value;
            default:
                return undefined;
        }
    }

    function parseEulerUnit(value) {
        switch (value) {
            case 'rad':
            case 'deg':
            case 'turn':
                return value;
            default:
                return undefined;
        }
    }

    const RotationInputPluginEuler = {
        id: 'rotation',
        type: 'input',
        css: '.tp-rotationswatchv_b,.tp-rotationgizmov_p{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:transparent;border-width:0;font-family:inherit;font-size:inherit;font-weight:inherit;margin:0;outline:none;padding:0}.tp-rotationswatchv_b{background-color:var(--btn-bg);border-radius:var(--elm-br);color:var(--btn-fg);cursor:pointer;display:block;font-weight:bold;height:var(--bld-us);line-height:var(--bld-us);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tp-rotationswatchv_b:hover{background-color:var(--btn-bg-h)}.tp-rotationswatchv_b:focus{background-color:var(--btn-bg-f)}.tp-rotationswatchv_b:active{background-color:var(--btn-bg-a)}.tp-rotationswatchv_b:disabled{opacity:0.5}.tp-rotationgizmov_p{background-color:var(--in-bg);border-radius:var(--elm-br);box-sizing:border-box;color:var(--in-fg);font-family:inherit;height:var(--bld-us);line-height:var(--bld-us);min-width:0;width:100%}.tp-rotationgizmov_p:hover{background-color:var(--in-bg-h)}.tp-rotationgizmov_p:focus{background-color:var(--in-bg-f)}.tp-rotationgizmov_p:active{background-color:var(--in-bg-a)}.tp-rotationgizmov_p:disabled{opacity:0.5}.tp-rotationv{position:relative}.tp-rotationv_quat .tp-txtv_i{padding-left:0}.tp-rotationv_root{background-color:var(--mo-bg);width:100%;height:calc( 2.0 * var(--bld-us))}.tp-rotationv_h{display:flex}.tp-rotationv_s{flex-grow:0;flex-shrink:0;width:var(--bld-us);margin-right:4px}.tp-rotationv_g{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-rotationv.tp-rotationv-expanded .tp-rotationv_g{margin-top:var(--bld-s);opacity:1}.tp-rotationv .tp-popv{left:calc(-1 * var(--cnt-h-p));right:calc(-1 * var(--cnt-h-p));top:var(--bld-us)}.tp-rotationswatchv path{stroke-linecap:round;stroke-linejoin:round}.tp-rotationswatchv_b{height:var(--bld-us);margin-right:4px;position:relative;width:var(--bld-us)}.tp-rotationswatchv_arc{fill:none;stroke:var(--btn-bg);stroke-width:1px}.tp-rotationswatchv_arcr{fill:var(--btn-fg);stroke:var(--btn-bg);stroke-width:1px}.tp-rotationgizmov{padding-left:calc(var(--bld-us) + 4px)}.tp-rotationgizmov path{stroke-linecap:round;stroke-linejoin:round}.tp-rotationgizmov_p{cursor:move;height:0;overflow:hidden;padding-bottom:100%;position:relative}.tp-rotationgizmov_g{display:block;height:100%;left:0;pointer-events:none;position:absolute;top:0;width:100%}.tp-rotationgizmov_axisx{stroke:#eb103f;stroke-width:2px}.tp-rotationgizmov_axisy{stroke:#4eeb10;stroke-width:2px}.tp-rotationgizmov_axisz{stroke:#1068eb;stroke-width:2px}.tp-rotationgizmov_axisn{stroke:var(--in-fg);stroke-width:2px}.tp-rotationgizmov_arcx{fill:none;stroke:var(--in-fg)}.tp-rotationgizmov_arcx.tp-rotationgizmov_arcx_hover{stroke:#eb103f}.tp-rotationgizmov_arcx.tp-rotationgizmov_arcx_active{stroke:#eb103f;stroke-width:2px}.tp-rotationgizmov_arcy{fill:none;stroke:var(--in-fg)}.tp-rotationgizmov_arcy.tp-rotationgizmov_arcy_hover{stroke:#4eeb10}.tp-rotationgizmov_arcy.tp-rotationgizmov_arcy_active{stroke:#4eeb10;stroke-width:2px}.tp-rotationgizmov_arcz{fill:none;stroke:var(--in-fg)}.tp-rotationgizmov_arcz.tp-rotationgizmov_arcz_hover{stroke:#1068eb}.tp-rotationgizmov_arcz.tp-rotationgizmov_arcz_active{stroke:#1068eb;stroke-width:2px}.tp-rotationgizmov_arcr{fill:none;stroke:var(--in-fg)}.tp-rotationgizmov_arcr.tp-rotationgizmov_arcr_hover{stroke:#ebd510}.tp-rotationgizmov_arcr.tp-rotationgizmov_arcr_active{stroke:#ebd510;stroke-width:2px}.tp-rotationgizmov_arcc{fill:none;stroke:transparent;stroke-width:5px;pointer-events:auto}.tp-rotationgizmov_labelcirclex{fill:#eb103f;cursor:pointer;pointer-events:auto}.tp-rotationgizmov_labelcirclex:hover{opacity:0.7}.tp-rotationgizmov_labelcircley{fill:#4eeb10;cursor:pointer;pointer-events:auto}.tp-rotationgizmov_labelcircley:hover{opacity:0.7}.tp-rotationgizmov_labelcirclez{fill:#1068eb;cursor:pointer;pointer-events:auto}.tp-rotationgizmov_labelcirclez:hover{opacity:0.7}.tp-rotationgizmov_labelcirclen{fill:var(--in-fg);cursor:pointer;pointer-events:auto}.tp-rotationgizmov_labelcirclen:hover{opacity:0.7}.tp-rotationgizmov_labeltext{fill:var(--btn-fg);stroke:var(--btn-fg);stroke-width:1px}.tp-rotationgizmov_p:focus .tp-rotationgizmov_m{background-color:var(--in-fg);border-width:0}',
        accept(exValue, params) {
            var _a, _b;
            // Parse parameters object
            const p = ParamsParsers;
            const result = parseParams(params, {
                view: p.required.constant('rotation'),
                label: p.optional.string,
                picker: p.optional.custom(parsePickerLayout),
                expanded: p.optional.boolean,
                rotationMode: p.required.constant('euler'),
                x: p.optional.custom(parsePointDimensionParams),
                y: p.optional.custom(parsePointDimensionParams),
                z: p.optional.custom(parsePointDimensionParams),
                order: p.optional.custom(parseEulerOrder),
                unit: p.optional.custom(parseEulerUnit),
            });
            return result ? {
                initialValue: parseEuler(exValue, (_a = result.order) !== null && _a !== void 0 ? _a : 'XYZ', (_b = result.unit) !== null && _b !== void 0 ? _b : 'rad'),
                params: result,
            } : null;
        },
        binding: {
            reader({ params }) {
                return (exValue) => {
                    var _a, _b;
                    return parseEuler(exValue, (_a = params.order) !== null && _a !== void 0 ? _a : 'XYZ', (_b = params.unit) !== null && _b !== void 0 ? _b : 'rad');
                };
            },
            constraint({ params }) {
                var _a, _b;
                return new PointNdConstraint({
                    assembly: createEulerAssembly((_a = params.order) !== null && _a !== void 0 ? _a : 'XYZ', (_b = params.unit) !== null && _b !== void 0 ? _b : 'rad'),
                    components: [
                        createDimensionConstraint('x' in params ? params.x : undefined),
                        createDimensionConstraint('y' in params ? params.y : undefined),
                        createDimensionConstraint('z' in params ? params.z : undefined),
                    ]
                });
            },
            writer(_args) {
                return (target, inValue) => {
                    target.writeProperty('x', inValue.x);
                    target.writeProperty('y', inValue.y);
                    target.writeProperty('z', inValue.z);
                };
            },
        },
        controller({ document, value, constraint, params, viewProps }) {
            var _a, _b;
            if (!(constraint instanceof PointNdConstraint)) {
                throw TpError.shouldNeverHappen();
            }
            const expanded = 'expanded' in params ? params.expanded : undefined;
            const picker = 'picker' in params ? params.picker : undefined;
            const unit = (_a = params.unit) !== null && _a !== void 0 ? _a : 'rad';
            const digits = {
                rad: 2,
                deg: 0,
                turn: 2,
            }[unit];
            return new RotationInputController(document, {
                axes: [
                    createAxisEuler(digits, constraint.components[0]),
                    createAxisEuler(digits, constraint.components[1]),
                    createAxisEuler(digits, constraint.components[2]),
                ],
                assembly: createEulerAssembly((_b = params.order) !== null && _b !== void 0 ? _b : 'XYZ', unit),
                rotationMode: 'euler',
                expanded: expanded !== null && expanded !== void 0 ? expanded : false,
                parser: parseNumber,
                pickerLayout: picker !== null && picker !== void 0 ? picker : 'popup',
                value,
                viewProps: viewProps,
            });
        },
    };

    const QuaternionAssembly = {
        toComponents: (r) => [
            r.x,
            r.y,
            r.z,
            r.w,
        ],
        fromComponents: (c) => new Quaternion(c[0], c[1], c[2], c[3]),
    };

    function createAxisQuaternion(constraint) {
        return {
            baseStep: 0.01,
            constraint: constraint,
            textProps: ValueMap.fromObject({
                draggingScale: 0.01,
                formatter: (value) => {
                    if (Math.abs(value) < 0.995) {
                        return value.toFixed(2).replace('0.', '.');
                    }
                    else {
                        return value.toFixed(1);
                    }
                },
            }),
        };
    }

    function parseQuaternion(exValue) {
        var _a, _b, _c, _d;
        if (typeof ((_a = exValue) === null || _a === void 0 ? void 0 : _a.x) === 'number' &&
            typeof ((_b = exValue) === null || _b === void 0 ? void 0 : _b.y) === 'number' &&
            typeof ((_c = exValue) === null || _c === void 0 ? void 0 : _c.z) === 'number' &&
            typeof ((_d = exValue) === null || _d === void 0 ? void 0 : _d.w) === 'number') {
            return new Quaternion(exValue.x, exValue.y, exValue.z, exValue.w);
        }
        else {
            return new Quaternion(0.0, 0.0, 0.0, 1.0);
        }
    }

    const RotationInputPluginQuaternion = {
        id: 'rotation',
        type: 'input',
        css: '.tp-rotationswatchv_b,.tp-rotationgizmov_p{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-color:transparent;border-width:0;font-family:inherit;font-size:inherit;font-weight:inherit;margin:0;outline:none;padding:0}.tp-rotationswatchv_b{background-color:var(--btn-bg);border-radius:var(--elm-br);color:var(--btn-fg);cursor:pointer;display:block;font-weight:bold;height:var(--bld-us);line-height:var(--bld-us);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tp-rotationswatchv_b:hover{background-color:var(--btn-bg-h)}.tp-rotationswatchv_b:focus{background-color:var(--btn-bg-f)}.tp-rotationswatchv_b:active{background-color:var(--btn-bg-a)}.tp-rotationswatchv_b:disabled{opacity:0.5}.tp-rotationgizmov_p{background-color:var(--in-bg);border-radius:var(--elm-br);box-sizing:border-box;color:var(--in-fg);font-family:inherit;height:var(--bld-us);line-height:var(--bld-us);min-width:0;width:100%}.tp-rotationgizmov_p:hover{background-color:var(--in-bg-h)}.tp-rotationgizmov_p:focus{background-color:var(--in-bg-f)}.tp-rotationgizmov_p:active{background-color:var(--in-bg-a)}.tp-rotationgizmov_p:disabled{opacity:0.5}.tp-rotationv{position:relative}.tp-rotationv_quat .tp-txtv_i{padding-left:0}.tp-rotationv_root{background-color:var(--mo-bg);width:100%;height:calc( 2.0 * var(--bld-us))}.tp-rotationv_h{display:flex}.tp-rotationv_s{flex-grow:0;flex-shrink:0;width:var(--bld-us);margin-right:4px}.tp-rotationv_g{height:0;margin-top:0;opacity:0;overflow:hidden;transition:height .2s ease-in-out,opacity .2s linear,margin .2s ease-in-out}.tp-rotationv.tp-rotationv-expanded .tp-rotationv_g{margin-top:var(--bld-s);opacity:1}.tp-rotationv .tp-popv{left:calc(-1 * var(--cnt-h-p));right:calc(-1 * var(--cnt-h-p));top:var(--bld-us)}.tp-rotationswatchv path{stroke-linecap:round;stroke-linejoin:round}.tp-rotationswatchv_b{height:var(--bld-us);margin-right:4px;position:relative;width:var(--bld-us)}.tp-rotationswatchv_arc{fill:none;stroke:var(--btn-bg);stroke-width:1px}.tp-rotationswatchv_arcr{fill:var(--btn-fg);stroke:var(--btn-bg);stroke-width:1px}.tp-rotationgizmov{padding-left:calc(var(--bld-us) + 4px)}.tp-rotationgizmov path{stroke-linecap:round;stroke-linejoin:round}.tp-rotationgizmov_p{cursor:move;height:0;overflow:hidden;padding-bottom:100%;position:relative}.tp-rotationgizmov_g{display:block;height:100%;left:0;pointer-events:none;position:absolute;top:0;width:100%}.tp-rotationgizmov_axisx{stroke:#eb103f;stroke-width:2px}.tp-rotationgizmov_axisy{stroke:#4eeb10;stroke-width:2px}.tp-rotationgizmov_axisz{stroke:#1068eb;stroke-width:2px}.tp-rotationgizmov_axisn{stroke:var(--in-fg);stroke-width:2px}.tp-rotationgizmov_arcx{fill:none;stroke:var(--in-fg)}.tp-rotationgizmov_arcx.tp-rotationgizmov_arcx_hover{stroke:#eb103f}.tp-rotationgizmov_arcx.tp-rotationgizmov_arcx_active{stroke:#eb103f;stroke-width:2px}.tp-rotationgizmov_arcy{fill:none;stroke:var(--in-fg)}.tp-rotationgizmov_arcy.tp-rotationgizmov_arcy_hover{stroke:#4eeb10}.tp-rotationgizmov_arcy.tp-rotationgizmov_arcy_active{stroke:#4eeb10;stroke-width:2px}.tp-rotationgizmov_arcz{fill:none;stroke:var(--in-fg)}.tp-rotationgizmov_arcz.tp-rotationgizmov_arcz_hover{stroke:#1068eb}.tp-rotationgizmov_arcz.tp-rotationgizmov_arcz_active{stroke:#1068eb;stroke-width:2px}.tp-rotationgizmov_arcr{fill:none;stroke:var(--in-fg)}.tp-rotationgizmov_arcr.tp-rotationgizmov_arcr_hover{stroke:#ebd510}.tp-rotationgizmov_arcr.tp-rotationgizmov_arcr_active{stroke:#ebd510;stroke-width:2px}.tp-rotationgizmov_arcc{fill:none;stroke:transparent;stroke-width:5px;pointer-events:auto}.tp-rotationgizmov_labelcirclex{fill:#eb103f;cursor:pointer;pointer-events:auto}.tp-rotationgizmov_labelcirclex:hover{opacity:0.7}.tp-rotationgizmov_labelcircley{fill:#4eeb10;cursor:pointer;pointer-events:auto}.tp-rotationgizmov_labelcircley:hover{opacity:0.7}.tp-rotationgizmov_labelcirclez{fill:#1068eb;cursor:pointer;pointer-events:auto}.tp-rotationgizmov_labelcirclez:hover{opacity:0.7}.tp-rotationgizmov_labelcirclen{fill:var(--in-fg);cursor:pointer;pointer-events:auto}.tp-rotationgizmov_labelcirclen:hover{opacity:0.7}.tp-rotationgizmov_labeltext{fill:var(--btn-fg);stroke:var(--btn-fg);stroke-width:1px}.tp-rotationgizmov_p:focus .tp-rotationgizmov_m{background-color:var(--in-fg);border-width:0}',
        accept(exValue, params) {
            // Parse parameters object
            const p = ParamsParsers;
            const result = parseParams(params, {
                view: p.required.constant('rotation'),
                label: p.optional.string,
                picker: p.optional.custom(parsePickerLayout),
                expanded: p.optional.boolean,
                rotationMode: p.optional.constant('quaternion'),
                x: p.optional.custom(parsePointDimensionParams),
                y: p.optional.custom(parsePointDimensionParams),
                z: p.optional.custom(parsePointDimensionParams),
                w: p.optional.custom(parsePointDimensionParams),
            });
            return result ? {
                initialValue: parseQuaternion(exValue),
                params: result,
            } : null;
        },
        binding: {
            reader(_args) {
                return (exValue) => {
                    return parseQuaternion(exValue);
                };
            },
            constraint({ params }) {
                return new PointNdConstraint({
                    assembly: QuaternionAssembly,
                    components: [
                        createDimensionConstraint('x' in params ? params.x : undefined),
                        createDimensionConstraint('y' in params ? params.y : undefined),
                        createDimensionConstraint('z' in params ? params.z : undefined),
                        createDimensionConstraint('w' in params ? params.w : undefined),
                    ]
                });
            },
            writer(_args) {
                return (target, inValue) => {
                    target.writeProperty('x', inValue.x);
                    target.writeProperty('y', inValue.y);
                    target.writeProperty('z', inValue.z);
                    target.writeProperty('w', inValue.w);
                };
            },
        },
        controller({ document, value, constraint, params, viewProps }) {
            if (!(constraint instanceof PointNdConstraint)) {
                throw TpError.shouldNeverHappen();
            }
            const expanded = 'expanded' in params ? params.expanded : undefined;
            const picker = 'picker' in params ? params.picker : undefined;
            return new RotationInputController(document, {
                axes: [
                    createAxisQuaternion(constraint.components[0]),
                    createAxisQuaternion(constraint.components[1]),
                    createAxisQuaternion(constraint.components[2]),
                    createAxisQuaternion(constraint.components[3]),
                ],
                assembly: QuaternionAssembly,
                rotationMode: 'quaternion',
                expanded: expanded !== null && expanded !== void 0 ? expanded : false,
                parser: parseNumber,
                pickerLayout: picker !== null && picker !== void 0 ? picker : 'popup',
                value,
                viewProps: viewProps,
            });
        },
    };

    const plugins = [
        RotationInputPluginEuler,
        RotationInputPluginQuaternion,
    ];

    exports.RotationInputPluginEuler = RotationInputPluginEuler;
    exports.RotationInputPluginQuaternion = RotationInputPluginQuaternion;
    exports.plugins = plugins;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
