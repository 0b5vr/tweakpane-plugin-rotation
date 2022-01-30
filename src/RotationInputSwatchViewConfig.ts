import type { Quaternion } from './Quaternion';
import type { Value, ViewProps } from '@tweakpane/core';

export interface RotationInputSwatchViewConfig {
  value: Value<Quaternion>
  viewProps: ViewProps;
}
