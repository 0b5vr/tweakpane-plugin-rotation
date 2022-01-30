import type { Quaternion } from './Quaternion';

export function isRotationInputRotation( input: unknown ): input is Quaternion {
  if ( typeof input !== 'object' ) { return false; }

  if (
    typeof ( input as any )?.x !== 'number' ||
    typeof ( input as any )?.y !== 'number' ||
    typeof ( input as any )?.z !== 'number' ||
    typeof ( input as any )?.w !== 'number'
  ) {
    return false;
  }

  return true;
}
