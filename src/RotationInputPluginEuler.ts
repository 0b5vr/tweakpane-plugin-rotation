import { BindingTarget, InputBindingPlugin, PointNdConstraint, TpError, createPlugin, parseNumber, parsePickerLayout, parsePointDimensionParams, parseRecord } from '@tweakpane/core';
import { Euler } from './Euler.js';
import { RotationInputController } from './RotationInputController.js';
import { createAxisEuler } from './createAxisEuler.js';
import { createDimensionConstraint } from './createDimensionConstraint.js';
import { createEulerAssembly } from './createEulerAssembly.js';
import { parseEuler } from './parseEuler.js';
import { parseEulerOrder } from './parseEulerOrder.js';
import { parseEulerUnit } from './parseEulerUnit.js';
import type { RotationInputPluginEulerParams } from './RotationInputPluginEulerParams.js';
import type { ValueController } from '@tweakpane/core';

export const RotationInputPluginEuler: InputBindingPlugin<
Euler,
Euler,
RotationInputPluginEulerParams
> = createPlugin( {
  id: 'rotation',
  type: 'input',

  accept( exValue: unknown, params: Record<string, unknown> ) {
    // Parse parameters object
    const result = parseRecord<RotationInputPluginEulerParams>( params, ( p ) => ( {
      view: p.required.constant( 'rotation' ),
      label: p.optional.string,
      picker: p.optional.custom( parsePickerLayout ),
      expanded: p.optional.boolean,
      rotationMode: p.required.constant( 'euler' ),
      x: p.optional.custom( parsePointDimensionParams ),
      y: p.optional.custom( parsePointDimensionParams ),
      z: p.optional.custom( parsePointDimensionParams ),
      order: p.optional.custom( parseEulerOrder ),
      unit: p.optional.custom( parseEulerUnit ),
    } ) );

    return result ? {
      initialValue: parseEuler( exValue, result.order ?? 'XYZ', result.unit ?? 'rad' ),
      params: result,
    } : null;
  },

  binding: {
    reader( { params } ) {
      return ( exValue: unknown ): Euler => {
        return parseEuler( exValue, params.order ?? 'XYZ', params.unit ?? 'rad' );
      };
    },

    constraint( { params } ) {
      return new PointNdConstraint( {
        assembly: createEulerAssembly( params.order ?? 'XYZ', params.unit ?? 'rad' ),
        components: [
          createDimensionConstraint( 'x' in params ? params.x : undefined ),
          createDimensionConstraint( 'y' in params ? params.y : undefined ),
          createDimensionConstraint( 'z' in params ? params.z : undefined ),
        ]
      } );
    },

    writer( _args ) {
      return ( target: BindingTarget, inValue: Euler ) => {
        target.writeProperty( 'x', inValue.x );
        target.writeProperty( 'y', inValue.y );
        target.writeProperty( 'z', inValue.z );
      };
    },
  },

  controller( { document, value, constraint, params, viewProps } ) {
    if ( !( constraint instanceof PointNdConstraint ) ) {
      throw TpError.shouldNeverHappen();
    }

    const expanded = 'expanded' in params ? params.expanded : undefined;
    const picker = 'picker' in params ? params.picker : undefined;

    const unit = params.unit ?? 'rad';
    const digits = {
      rad: 2,
      deg: 0,
      turn: 2,
    }[ unit ];

    return new RotationInputController( document, {
      axes: [
        createAxisEuler( digits, constraint.components[ 0 ] ),
        createAxisEuler( digits, constraint.components[ 1 ] ),
        createAxisEuler( digits, constraint.components[ 2 ] ),
      ],
      assembly: createEulerAssembly( params.order ?? 'XYZ', unit ),
      rotationMode: 'euler',
      expanded: expanded ?? false,
      parser: parseNumber,
      pickerLayout: picker ?? 'popup',
      value,
      viewProps: viewProps,
    } ) as unknown as ValueController<Euler>; // TODO: resolve type puzzle
  },
} );
