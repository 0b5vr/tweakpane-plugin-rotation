import type { PickerLayout, Value, ViewProps } from '@tweakpane/core';
import type { Rotation } from './Rotation.js';
export interface RotationInputGizmoViewConfig {
    value: Value<Rotation>;
    mode: Value<'free' | 'angle-x' | 'angle-y' | 'angle-z' | 'angle-r' | 'auto'>;
    viewProps: ViewProps;
    pickerLayout: PickerLayout;
}
