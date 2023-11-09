import { Euler } from './Euler.js';
import type { EulerOrder } from './EulerOrder.js';
import type { EulerUnit } from './EulerUnit.js';
import type { PointNdAssembly } from '@tweakpane/core/dist/input-binding/common/model/point-nd.js';

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
