import { Euler } from './Euler';
import { Parser, PickerLayout, Value, ViewProps } from '@tweakpane/core';
import { PointNdAssembly } from '@tweakpane/core/dist/cjs/input-binding/common/model/point-nd';
import { Quaternion } from './Quaternion';
import { Rotation } from './Rotation';
import { RotationInputAxis } from './RotationInputAxis';
import { RotationInputRotationMode } from './RotationInputRotationMode';
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
