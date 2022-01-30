import { Quaternion } from './Quaternion';

export class Vector3 {
  public x: number;
  public y: number;
  public z: number;

  public constructor( x?: number, y?: number, z?: number ) {
    this.x = x ?? 0.0;
    this.y = y ?? 0.0;
    this.z = z ?? 0.0;
  }

  public getComponents(): number[] {
    return [ this.x, this.y, this.z ];
  }

  public get lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  public get length(): number {
    return Math.sqrt( this.lengthSq );
  }

  public get normalized(): Vector3 {
    const l = this.length;

    if ( l === 0.0 ) {
      return new Vector3();
    }

    return new Vector3(
      this.x / l,
      this.y / l,
      this.z / l,
    );
  }

  public get negated(): Vector3 {
    return new Vector3( -this.x, -this.y, -this.z );
  }

  public add( v: Vector3 ): Vector3 {
    return new Vector3(
      this.x + v.x,
      this.y + v.y,
      this.z + v.z,
    );
  }

  public sub( v: Vector3 ): Vector3 {
    return new Vector3(
      this.x - v.x,
      this.y - v.y,
      this.z - v.z,
    );
  }

  public scale( s: number ): Vector3 {
    return new Vector3(
      this.x * s,
      this.y * s,
      this.z * s,
    );
  }

  public dot( v: Vector3 ): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  public cross( v: Vector3 ): Vector3 {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x,
    );
  }

  public orthoNormalize( tangent: Vector3 ): {
    normal: Vector3,
    tangent: Vector3,
    binormal: Vector3,
  } {
    const normal = this.normalized;
    tangent = tangent.normalized;

    let dotNT = normal.dot( tangent );

    if ( dotNT === 1.0 ) {
      if ( Math.abs( normal.y ) > Math.abs( normal.z ) ) {
        tangent = new Vector3( 0.0, 0.0, 1.0 );
      } else {
        tangent = new Vector3( 0.0, 1.0, 0.0 );
      }
      dotNT = normal.dot( tangent );
    }

    tangent = tangent.sub( normal.scale( dotNT ) ).normalized;

    const binormal = tangent.cross( normal );

    return {
      normal,
      tangent,
      binormal,
    };
  }

  public applyQuaternion( q: Quaternion ): Vector3 {
    const ix = q.w * this.x + q.y * this.z - q.z * this.y;
    const iy = q.w * this.y + q.z * this.x - q.x * this.z;
    const iz = q.w * this.z + q.x * this.y - q.y * this.x;
    const iw = -q.x * this.x - q.y * this.y - q.z * this.z;

    return new Vector3(
      ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y,
      iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z,
      iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x,
    );
  }
}
