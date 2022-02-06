import { Euler } from './Euler';
import { EulerOrder } from './EulerOrder';

export function parseEuler( exValue: unknown, order: EulerOrder ): Euler {
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
    );
  } else {
    return new Euler( 0.0, 0.0, 0.0, order );
  }
}
