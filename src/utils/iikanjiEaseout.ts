import { saturate } from './saturate';

/**
 * hand-picked random polynomial that looks cool
 * clamped in [0.0 - 1.0]
 */
export function iikanjiEaseout( x: number ): number {
  if ( x <= 0.0 ) { return 0.0; }
  if ( x >= 1.0 ) { return 1.0; }

  const xt = 1.0 - x;

  const y = xt * (
    xt * (
      xt * (
        xt * (
          xt * (
            xt * (
              xt * (
                -6
              ) + 7
            )
          )
        )
      )
    )
  );
  return saturate( 1.0 - y );
}
