import { RotationInputSwatchView } from './RotationInputSwatchView';
import { Controller, Value, ViewProps } from '@tweakpane/core';
import { Rotation } from './Rotation';
import { RotationInputSwatchControllerConfig } from './RotationInputSwatchControllerConfig';
export declare class RotationInputSwatchController implements Controller<RotationInputSwatchView> {
    readonly value: Value<Rotation>;
    readonly view: RotationInputSwatchView;
    readonly viewProps: ViewProps;
    constructor(doc: Document, config: RotationInputSwatchControllerConfig);
}
