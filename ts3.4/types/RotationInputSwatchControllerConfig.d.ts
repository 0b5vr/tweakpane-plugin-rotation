import { Quaternion } from './Quaternion';
import { Value, ViewProps } from '@tweakpane/core';
export interface RotationInputSwatchControllerConfig {
    value: Value<Quaternion>;
    viewProps: ViewProps;
}
