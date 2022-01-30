import type { RotationInputRotationMode } from './RotationInputRotationMode';

export function parseRotationMode( value: unknown ): RotationInputRotationMode | undefined {
  switch ( value ) {
  case 'eulerXYZ':
  case 'eulerXZY':
  case 'eulerYXZ':
  case 'eulerYZX':
  case 'eulerZXY':
  case 'eulerZYX':
  case 'quaternion':
  case 'axisAngle':
    return value;
  default:
    return undefined;
  }
}
