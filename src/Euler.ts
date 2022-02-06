import { EulerOrder } from './EulerOrder';
import { Quaternion } from './Quaternion';
import { Rotation } from './Rotation';
import { clamp } from './utils/clamp';
import { sanitizeAngle } from './utils/sanitizeAngle';

export class Euler extends Rotation {
  public static fromQuaternion( quat: Quaternion, order: EulerOrder ): Euler {
    const m = quat.toMat3();

    const [ i, j, k, sign ] =
      order === 'XYZ' ? [ 0, 1, 2, 1 ] :
      order === 'XZY' ? [ 0, 2, 1, -1 ] :
      order === 'YXZ' ? [ 1, 0, 2, -1 ] :
      order === 'YZX' ? [ 1, 2, 0, 1 ] :
      order === 'ZXY' ? [ 2, 0, 1, 1 ] :
      [ 2, 1, 0, -1 ];

    const result: [ number, number, number ] = [ 0.0, 0.0, 0.0 ];

    const c = m[ k + i * 3 ];
    result[ j ] = -sign * Math.asin( clamp( c, -1.0, 1.0 ) );

    if ( Math.abs( c ) < 0.999999 ) {
      result[ i ] = sign * Math.atan2( m[ k + j * 3 ], m[ k * 4 ] );
      result[ k ] = sign * Math.atan2( m[ j + i * 3 ], m[ i * 4 ] );
    } else {
      // "y is 90deg" cases
      result[ i ] = sign * Math.atan2( -m[ j + k * 3 ], m[ j * 4 ] );
    }

    if ( Math.abs( result[ i ] ) + Math.abs( result[ k ] ) > Math.PI ) {
      // "two big revolutions" cases
      result[ i ] = sanitizeAngle( result[ i ] + Math.PI );
      result[ j ] = sanitizeAngle( Math.PI - result[ j ] );
      result[ k ] = sanitizeAngle( result[ k ] + Math.PI );
    }

    return new Euler( ...result, order );
  }

  public x: number;
  public y: number;
  public z: number;
  public order: EulerOrder;

  public constructor( x?: number, y?: number, z?: number, order?: EulerOrder ) {
    super();

    this.x = x ?? 0.0;
    this.y = y ?? 0.0;
    this.z = z ?? 0.0;
    this.order = order ?? 'XYZ';
  }

  public get quat(): Quaternion {
    return Quaternion.fromEuler( this );
  }

  public getComponents(): [ number, number, number ] {
    return [ this.x, this.y, this.z ];
  }

  public toEuler( order: EulerOrder ): Euler {
    return this.reorder( order );
  }

  public format( r: Rotation ): Euler {
    if ( r instanceof Euler ) {
      return r.reorder( this.order );
    }

    return r.toEuler( this.order );
  }

  public reorder( order: EulerOrder ): Euler {
    if ( order === this.order ) {
      return this;
    }

    return this.quat.toEuler( order );
  }
}
