import type { PickerLayout, Value, ViewProps } from '@tweakpane/core';
import type { Quaternion } from './Quaternion';

export interface RotationInputGizmoViewConfig {
  value: Value<Quaternion>;
  mode: Value<'free' | 'x' | 'y' | 'z'>;
  viewProps: ViewProps;
  pickerLayout: PickerLayout;
}
