import { RotationInputSwatchView } from './RotationInputSwatchView';
import { Controller, Value, ViewProps } from '@tweakpane/core';
import { Quaternion } from './Quaternion';
import { RotationInputSwatchControllerConfig } from './RotationInputSwatchControllerConfig';
export declare class RotationInputSwatchController implements Controller<RotationInputSwatchView> {
    readonly value: Value<Quaternion>;
    readonly view: RotationInputSwatchView;
    readonly viewProps: ViewProps;
    constructor(doc: Document, config: RotationInputSwatchControllerConfig);
}
