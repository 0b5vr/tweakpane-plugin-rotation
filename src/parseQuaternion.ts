import { Quaternion } from './Quaternion.js';

export function parseQuaternion( exValue: unknown ): Quaternion {
  if (
    typeof ( exValue as any )?.x === 'number' &&
    typeof ( exValue as any )?.y === 'number' &&
    typeof ( exValue as any )?.z === 'number' &&
    typeof ( exValue as any )?.w === 'number'
  ) {
    return new Quaternion(
      ( exValue as any ).x,
      ( exValue as any ).y,
      ( exValue as any ).z,
      ( exValue as any ).w,
    );
  } else {
    return new Quaternion( 0.0, 0.0, 0.0, 1.0 );
  }
}
