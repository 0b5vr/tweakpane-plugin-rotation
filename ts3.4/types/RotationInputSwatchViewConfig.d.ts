import { Quaternion } from './Quaternion';
import { Value, ViewProps } from '@tweakpane/core';
export interface RotationInputSwatchViewConfig {
    value: Value<Quaternion>;
    viewProps: ViewProps;
}
