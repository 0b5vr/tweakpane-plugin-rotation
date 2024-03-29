import { Quaternion } from './Quaternion.js';
import { Vector3 } from './Vector3.js';

export function createArcRotation( axis: Vector3, front: Vector3 ): Quaternion {
  const b = front.z > 0.0
    ? new Quaternion( 0.0, 0.0, 0.0, 1.0 )
    : new Quaternion( 0.0, 0.0, 1.0, 0.0 );

  if ( Math.abs( axis.z ) > 0.9999 ) {
    return b;
  }

  return Quaternion.lookRotation( axis, front );
}
