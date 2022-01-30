import { BindingTarget, InputBindingPlugin, ParamsParsers, PointNdConstraint, TpError, parseNumber, parseParams, parsePickerLayout, parsePointDimensionParams } from '@tweakpane/core';
import { Quaternion } from './Quaternion';
import { RotationInputController } from './RotationInputController';
import { RotationInputRotationAssembly } from './RotationInputRotationAssembly';
import { createAxis } from './createAxis';
import { createDimensionConstraint } from './createDimensionConstraint';
import { isRotationInputRotation } from './isRotationInputRotation';
import { parseRotationMode } from './parseRotationMode';
import type { RotationInputPluginParams } from './RotationInputPluginParams';

export const RotationInputPlugin: InputBindingPlugin<
Quaternion,
Quaternion,
RotationInputPluginParams
> = {
  id: 'rotation',
  type: 'input',
  css: '__css__',

  accept( exValue: unknown, params: Record<string, unknown> ) {
    if ( !isRotationInputRotation( exValue ) ) {
      return null;
    }

    // Parse parameters object
    const p = ParamsParsers;
    const result = parseParams<RotationInputPluginParams>( params, {
      view: p.required.constant( 'rotation' ),
      label: p.optional.string,
      picker: p.optional.custom( parsePickerLayout ),
      expanded: p.optional.boolean,
      rotationMode: p.optional.custom( parseRotationMode ),
      x: p.optional.custom( parsePointDimensionParams ),
      y: p.optional.custom( parsePointDimensionParams ),
      z: p.optional.custom( parsePointDimensionParams ),
      w: p.optional.custom( parsePointDimensionParams ),
    } );

    return result ? {
      initialValue: exValue,
      params: result,
    } : null;
  },

  binding: {
    reader( _args ) {
      return ( exValue: unknown ): Quaternion => {
        // TODO conversion

        if ( isRotationInputRotation( exValue ) ) {
          return exValue;
        } else {
          return new Quaternion();
        }
      };
    },

    constraint( { params } ) {
      return new PointNdConstraint( {
        assembly: RotationInputRotationAssembly,
        components: [
          createDimensionConstraint( 'x' in params ? params.x : undefined ),
          createDimensionConstraint( 'y' in params ? params.y : undefined ),
          createDimensionConstraint( 'z' in params ? params.z : undefined ),
          createDimensionConstraint( 'w' in params ? params.w : undefined ),
        ]
      } );
    },

    writer( _args ) {
      return ( target: BindingTarget, inValue ) => {
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

    const rotationMode = params.rotationMode ?? 'quaternion';
    const expanded = 'expanded' in params ? params.expanded : undefined;
    const picker = 'picker' in params ? params.picker : undefined;

    return new RotationInputController( document, {
      axes: [
        createAxis( value.rawValue.x, constraint.components[ 0 ] ),
        createAxis( value.rawValue.y, constraint.components[ 1 ] ),
        createAxis( value.rawValue.z, constraint.components[ 2 ] ),
        createAxis( value.rawValue.w, constraint.components[ 3 ] ),
      ],
      rotationMode,
      expanded: expanded ?? false,
      parser: parseNumber,
      pickerLayout: picker ?? 'popup',
      value,
      viewProps: viewProps,
    } );
  },
};
