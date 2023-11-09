import { RotationInputSwatchView } from './RotationInputSwatchView.js';
import type { Controller, Value, ViewProps } from '@tweakpane/core';
import type { Rotation } from './Rotation.js';
import type { RotationInputSwatchControllerConfig } from './RotationInputSwatchControllerConfig.js';
export declare class RotationInputSwatchController implements Controller<RotationInputSwatchView> {
    readonly value: Value<Rotation>;
    readonly view: RotationInputSwatchView;
    readonly viewProps: ViewProps;
    constructor(doc: Document, config: RotationInputSwatchControllerConfig);
}
