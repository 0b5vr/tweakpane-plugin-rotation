import type { PickerLayout, Value, ViewProps } from '@tweakpane/core';
import type { Quaternion } from './Quaternion';

export interface RotationInputGizmoControllerConfig {
  value: Value<Quaternion>;
  viewProps: ViewProps;
  pickerLayout: PickerLayout;
}
