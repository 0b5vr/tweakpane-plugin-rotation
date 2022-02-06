import type { BaseInputParams, PickerLayout, PointDimensionParams } from '@tweakpane/core';
import type { EulerOrder } from './EulerOrder';

export interface RotationInputPluginEulerParams extends BaseInputParams {
  view: 'rotation';
  expanded?: boolean;
  picker?: PickerLayout;
  rotationMode: 'euler';
  order?: EulerOrder;
  x?: PointDimensionParams;
  y?: PointDimensionParams;
  z?: PointDimensionParams;
}
