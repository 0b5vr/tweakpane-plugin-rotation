import type { EulerUnit } from './EulerUnit.js';

export function parseEulerUnit( value: unknown ): EulerUnit | undefined {
  switch ( value ) {
  case 'rad':
  case 'deg':
  case 'turn':
    return value;
  default:
    return undefined;
  }
}
