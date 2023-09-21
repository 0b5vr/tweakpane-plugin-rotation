import type { EulerOrder } from './EulerOrder.js';

export function parseEulerOrder( value: unknown ): EulerOrder | undefined {
  switch ( value ) {
  case 'XYZ':
  case 'XZY':
  case 'YXZ':
  case 'YZX':
  case 'ZXY':
  case 'ZYX':
    return value;
  default:
    return undefined;
  }
}
