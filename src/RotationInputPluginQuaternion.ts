import { BindingTarget, InputBindingPlugin, PointNdConstraint, TpError, ValueController, createPlugin, parseNumber, parsePickerLayout,  parsePointDimensionParams, parseRecord } from '@tweakpane/core';
import { Quaternion } from './Quaternion.js';
import { QuaternionAssembly } from './QuaternionAssembly.js';
import { RotationInputController } from './RotationInputController.js';
import { createAxisQuaternion } from './createAxisQuaternion.js';
import { createDimensionConstraint } from './createDimensionConstraint.js';
import { parseQuaternion } from './parseQuaternion.js';
import type { RotationInputPluginQuaternionParams } from './RotationInputPluginQuaternionParams.js';

export const RotationInputPluginQuaternion: InputBindingPlugin<
Quaternion,
Quaternion,
RotationInputPluginQuaternionParams
> = createPlugin( {
  id: 'rotation',
  type: 'input',

  accept( exValue: unknown, params: Record<string, unknown> ) {
    // Parse parameters object
    const result = parseRecord<RotationInputPluginQuaternionParams>( params, ( p ) => ( {
      view: p.required.constant( 'rotation' ),
      label: p.optional.string,
      picker: p.optional.custom( parsePickerLayout ),
      expanded: p.optional.boolean,
      rotationMode: p.optional.constant( 'quaternion' ),
      x: p.optional.custom( parsePointDimensionParams ),
      y: p.optional.custom( parsePointDimensionParams ),
      z: p.optional.custom( parsePointDimensionParams ),
      w: p.optional.custom( parsePointDimensionParams ),
    } ) );

    return result ? {
      initialValue: parseQuaternion( exValue ),
      params: result,
    } : null;
  },

  binding: {
    reader( _args ) {
      return ( exValue: unknown ): Quaternion => {
        return parseQuaternion( exValue );
      };
    },

    constraint( { params } ) {
      return new PointNdConstraint( {
        assembly: QuaternionAssembly,
        components: [
          createDimensionConstraint( 'x' in params ? params.x : undefined ),
          createDimensionConstraint( 'y' in params ? params.y : undefined ),
          createDimensionConstraint( 'z' in params ? params.z : undefined ),
          createDimensionConstraint( 'w' in params ? params.w : undefined ),
        ]
      } );
    },

    writer( _args ) {
      return ( target: BindingTarget, inValue: Quaternion ) => {
        target.writeProperty( 'x', inValue.x );
        target.writeProperty( 'y', inValue.y );
        target.writeProperty( 'z', inValue.z );
        target.writeProperty( 'w', inValue.w );
      };
    },
  },

  controller( { document, value, constraint, params, viewProps } ) {
    if ( !( constraint instanceof PointNdConstraint ) ) {
      throw TpError.shouldNeverHappen();
    }

    const expanded = 'expanded' in params ? params.expanded : undefined;
    const picker = 'picker' in params ? params.picker : undefined;

    return new RotationInputController( document, {
      axes: [
        createAxisQuaternion( constraint.components[ 0 ] ),
        createAxisQuaternion( constraint.components[ 1 ] ),
        createAxisQuaternion( constraint.components[ 2 ] ),
        createAxisQuaternion( constraint.components[ 3 ] ),
      ],
      assembly: QuaternionAssembly,
      rotationMode: 'quaternion',
      expanded: expanded ?? false,
      parser: parseNumber,
      pickerLayout: picker ?? 'popup',
      value,
      viewProps: viewProps,
    } )  as unknown as ValueController<Quaternion>; // TODO;
  },
} );
