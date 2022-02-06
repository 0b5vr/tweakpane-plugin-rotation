import { RotationInputSwatchView } from './RotationInputSwatchView';
import type { Controller, Value, ViewProps } from '@tweakpane/core';
import type { Rotation } from './Rotation';
import type { RotationInputSwatchControllerConfig } from './RotationInputSwatchControllerConfig';
export declare class RotationInputSwatchController implements Controller<RotationInputSwatchView> {
    readonly value: Value<Rotation>;
    readonly view: RotationInputSwatchView;
    readonly viewProps: ViewProps;
    constructor(doc: Document, config: RotationInputSwatchControllerConfig);
}
