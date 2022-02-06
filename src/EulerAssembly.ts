import { Euler } from './Euler';
import type { PointNdAssembly } from '@tweakpane/core/dist/cjs/input-binding/common/model/point-nd';

export const EulerAssembly: PointNdAssembly<Euler> = {
  toComponents: ( r: Euler ) => [
    r.x,
    r.y,
    r.z,
  ],
  fromComponents: ( c: number[] ) => new Euler(
    c[ 0 ],
    c[ 1 ],
    c[ 2 ],
  ),
};
