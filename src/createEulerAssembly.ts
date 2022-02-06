import { Euler } from './Euler';
import type { EulerOrder } from './EulerOrder';
import type { EulerUnit } from './EulerUnit';
import type { PointNdAssembly } from '@tweakpane/core/dist/cjs/input-binding/common/model/point-nd';

export function createEulerAssembly( order: EulerOrder, unit: EulerUnit ): PointNdAssembly<Euler> {
  return {
    toComponents: ( r: Euler ) => r.getComponents(),
    fromComponents: ( c: number[] ) => new Euler(
      c[ 0 ],
      c[ 1 ],
      c[ 2 ],
      order,
      unit,
    ),
  };
}
