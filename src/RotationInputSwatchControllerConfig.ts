import type { Quaternion } from './Quaternion';
import type { Value, ViewProps } from '@tweakpane/core';

export interface RotationInputSwatchControllerConfig {
  value: Value<Quaternion>;
  viewProps: ViewProps;
}
