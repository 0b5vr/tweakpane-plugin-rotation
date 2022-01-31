import { saturate } from './saturate';

/**
 * hand-picked random polynomial that looks cool
 * clamped in [0.0 - 1.0]
 */
export function iikanjiEaseout( x: number ): number {
  if ( x <= 0.0 ) { return 0.0; }
  if ( x >= 1.0 ) { return 1.0; }

  // a7 = 30, k = 0.08
  const y = x * (
    x * (
      x * (
        x * (
          x * (
            x * (
              x * (
                30
              ) - 126
            ) + 204
          ) - 153
        ) + 46
      )
    )
  );
  return saturate( y );
}
