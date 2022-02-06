import { Quaternion } from './Quaternion';
import type { PointNdAssembly } from '@tweakpane/core/dist/cjs/input-binding/common/model/point-nd';

export const QuaternionAssembly: PointNdAssembly<Quaternion> = {
  toComponents: ( r: Quaternion ) => [
    r.x,
    r.y,
    r.z,
    r.w,
  ],
  fromComponents: ( c: number[] ) => new Quaternion(
    c[ 0 ],
    c[ 1 ],
    c[ 2 ],
    c[ 3 ],
  ),
};
