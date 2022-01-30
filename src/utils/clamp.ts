export function clamp( x: number, l: number, h: number ): number {
  return Math.min( Math.max( x, l ), h );
}
