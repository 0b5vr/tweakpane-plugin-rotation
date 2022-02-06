import type { Euler } from './Euler';
import type { Parser, PickerLayout, Value, ViewProps } from '@tweakpane/core';
import type { PointNdAssembly } from '@tweakpane/core/dist/cjs/input-binding/common/model/point-nd';
import type { Quaternion } from './Quaternion';
import type { Rotation } from './Rotation';
import type { RotationInputAxis } from './RotationInputAxis';
import type { RotationInputRotationMode } from './RotationInputRotationMode';

export interface RotationInputControllerConfig {
  axes: RotationInputAxis[];
  assembly: PointNdAssembly<Quaternion> | PointNdAssembly<Euler>;
  expanded: boolean;
  parser: Parser<number>;
  pickerLayout: PickerLayout;
  rotationMode: RotationInputRotationMode;
  value: Value<Rotation>;
  viewProps: ViewProps;
}
