import { Euler } from './Euler';
import { EulerOrder } from './EulerOrder';
import { EulerUnit } from './EulerUnit';

export function parseEuler( exValue: unknown, order: EulerOrder, unit: EulerUnit ): Euler {
  if (
    typeof ( exValue as any )?.x === 'number' &&
    typeof ( exValue as any )?.y === 'number' &&
    typeof ( exValue as any )?.z === 'number'
  ) {
    return new Euler(
      ( exValue as any ).x,
      ( exValue as any ).y,
      ( exValue as any ).z,
      order,
      unit,
    );
  } else {
    return new Euler( 0.0, 0.0, 0.0, order, unit );
  }
}
