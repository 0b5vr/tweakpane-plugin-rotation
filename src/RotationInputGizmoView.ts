import { ClassName, SVG_NS, Value, View } from '@tweakpane/core';
import { PointProjector } from './PointProjector.js';
import { Quaternion } from './Quaternion.js';
import { SVGLineStrip } from './SVGLineStrip.js';
import { Vector3 } from './Vector3.js';
import { createArcRotation } from './createArcRotation.js';
import { createArcVerticesArray } from './createArcVerticesArray.js';
import type { Rotation } from './Rotation.js';
import type { RotationInputGizmoViewConfig } from './RotationInputGizmoViewConfig.js';

const className = ClassName( 'rotationgizmo' );

const VEC3_ZERO = new Vector3( 0.0, 0.0, 0.0 );
const VEC3_XP = new Vector3( 1.0, 0.0, 0.0 );
const VEC3_YP = new Vector3( 0.0, 1.0, 0.0 );
const VEC3_ZP = new Vector3( 0.0, 0.0, 1.0 );
const VEC3_ZN = new Vector3( 0.0, 0.0, -1.0 );
const VEC3_XP70 = new Vector3( 0.7, 0.0, 0.0 );
const VEC3_YP70 = new Vector3( 0.0, 0.7, 0.0 );
const VEC3_ZP70 = new Vector3( 0.0, 0.0, 0.7 );
const VEC3_XN70 = new Vector3( -0.7, 0.0, 0.0 );
const VEC3_YN70 = new Vector3( 0.0, -0.7, 0.0 );
const VEC3_ZN70 = new Vector3( 0.0, 0.0, -0.7 );
const QUAT_IDENTITY = new Quaternion( 0.0, 0.0, 0.0, 1.0 );

function createLabel( doc: Document, circleClass: string, labelText: string ): SVGGElement {
  const label = doc.createElementNS( SVG_NS, 'g' );

  const circle = doc.createElementNS( SVG_NS, 'circle' );
  circle.classList.add( className( circleClass ) );
  circle.setAttributeNS( null, 'cx', '0' );
  circle.setAttributeNS( null, 'cy', '0' );
  circle.setAttributeNS( null, 'r', '8' );
  label.appendChild( circle );

  const text = doc.createElementNS( SVG_NS, 'text' );
  text.classList.add( className( 'labeltext' ) );
  text.setAttributeNS( null, 'y', '4' );
  text.setAttributeNS( null, 'text-anchor', 'middle' );
  text.setAttributeNS( null, 'font-size', '10' );
  text.textContent = labelText;
  label.appendChild( text );

  return label;
}

export class RotationInputGizmoView implements View {
  public readonly element: HTMLElement;
  public readonly padElement: HTMLDivElement;
  public readonly value: Value<Rotation>;
  public readonly xLabel: SVGGElement;
  public readonly yLabel: SVGGElement;
  public readonly zLabel: SVGGElement;
  public readonly xnLabel: SVGGElement;
  public readonly ynLabel: SVGGElement;
  public readonly znLabel: SVGGElement;
  private readonly mode_: Value<'free' | 'angle-x' | 'angle-y' | 'angle-z' | 'angle-r' | 'auto'>;
  private readonly svgElem_: Element;
  private readonly axesElem_: Element;
  private readonly labelsElem_: Element;
  private readonly projector_: PointProjector;
  private readonly xAxis_: SVGLineStrip;
  private readonly yAxis_: SVGLineStrip;
  private readonly zAxis_: SVGLineStrip;
  private readonly xnAxis_: SVGLineStrip;
  private readonly ynAxis_: SVGLineStrip;
  private readonly znAxis_: SVGLineStrip;
  private readonly xArcB_: SVGLineStrip;
  private readonly yArcB_: SVGLineStrip;
  private readonly zArcB_: SVGLineStrip;
  private readonly xArcBC_: SVGLineStrip;
  private readonly yArcBC_: SVGLineStrip;
  private readonly zArcBC_: SVGLineStrip;
  private readonly xArcF_: SVGLineStrip;
  private readonly yArcF_: SVGLineStrip;
  private readonly zArcF_: SVGLineStrip;
  private readonly xArcFC_: SVGLineStrip;
  private readonly yArcFC_: SVGLineStrip;
  private readonly zArcFC_: SVGLineStrip;
  private readonly rArc_: SVGLineStrip;
  private readonly rArcC_: SVGLineStrip;

  public get xArcBElement(): SVGPathElement { return this.xArcBC_.element; }
  public get yArcBElement(): SVGPathElement { return this.yArcBC_.element; }
  public get zArcBElement(): SVGPathElement { return this.zArcBC_.element; }
  public get xArcFElement(): SVGPathElement { return this.xArcFC_.element; }
  public get yArcFElement(): SVGPathElement { return this.yArcFC_.element; }
  public get zArcFElement(): SVGPathElement { return this.zArcFC_.element; }
  public get rArcElement(): SVGPathElement { return this.rArcC_.element; }

  public constructor( doc: Document, config: RotationInputGizmoViewConfig ) {
    this.onFoldableChange_ = this.onFoldableChange_.bind( this );
    this.onValueChange_ = this.onValueChange_.bind( this );
    this.onModeChange_ = this.onModeChange_.bind( this );

    this.element = doc.createElement( 'div' );
    this.element.classList.add( className() );
    if ( config.pickerLayout === 'popup' ) {
      this.element.classList.add( className( undefined, 'p' ) );
    }

    const padElem = doc.createElement( 'div' );
    padElem.classList.add( className( 'p' ) );
    config.viewProps.bindTabIndex( padElem );
    this.element.appendChild( padElem );
    this.padElement = padElem;

    const svgElem = doc.createElementNS( SVG_NS, 'svg' );
    svgElem.classList.add( className( 'g' ) );
    this.padElement.appendChild( svgElem );
    this.svgElem_ = svgElem;

    this.projector_ = new PointProjector();
    this.projector_.viewport = [ 0, 0, 136, 136 ];

    const arcArray = createArcVerticesArray( 0.0, Math.PI, 33, 'x', 'y' );
    const arcArrayR = createArcVerticesArray( 0.0, 2.0 * Math.PI, 65, 'x', 'y', 1.1 );

    // back arc
    this.xArcB_ = new SVGLineStrip( doc, arcArray, this.projector_ );
    this.xArcB_.element.classList.add( className( 'arcx' ) );
    this.svgElem_.appendChild( this.xArcB_.element );

    this.yArcB_ = new SVGLineStrip( doc, arcArray, this.projector_ );
    this.yArcB_.element.classList.add( className( 'arcy' ) );
    this.svgElem_.appendChild( this.yArcB_.element );

    this.zArcB_ = new SVGLineStrip( doc, arcArray, this.projector_ );
    this.zArcB_.element.classList.add( className( 'arcz' ) );
    this.svgElem_.appendChild( this.zArcB_.element );

    this.xArcBC_ = new SVGLineStrip( doc, arcArray, this.projector_ );
    this.xArcBC_.element.classList.add( className( 'arcc' ) );
    this.svgElem_.appendChild( this.xArcBC_.element );

    this.yArcBC_ = new SVGLineStrip( doc, arcArray, this.projector_ );
    this.yArcBC_.element.classList.add( className( 'arcc' ) );
    this.svgElem_.appendChild( this.yArcBC_.element );

    this.zArcBC_ = new SVGLineStrip( doc, arcArray, this.projector_ );
    this.zArcBC_.element.classList.add( className( 'arcc' ) );
    this.svgElem_.appendChild( this.zArcBC_.element );

    // axes
    const axesElem = doc.createElementNS( SVG_NS, 'g' );
    svgElem.classList.add( className( 'axes' ) );
    this.svgElem_.appendChild( axesElem );
    this.axesElem_ = axesElem;

    this.xAxis_ = new SVGLineStrip( doc, [ VEC3_ZERO, VEC3_XP70 ], this.projector_ );
    this.xAxis_.element.classList.add( className( 'axisx' ) );
    this.axesElem_.appendChild( this.xAxis_.element );

    this.yAxis_ = new SVGLineStrip( doc, [ VEC3_ZERO, VEC3_YP70 ], this.projector_ );
    this.yAxis_.element.classList.add( className( 'axisy' ) );
    this.axesElem_.appendChild( this.yAxis_.element );

    this.zAxis_ = new SVGLineStrip( doc, [ VEC3_ZERO, VEC3_ZP70 ], this.projector_ );
    this.zAxis_.element.classList.add( className( 'axisz' ) );
    this.axesElem_.appendChild( this.zAxis_.element );

    this.xnAxis_ = new SVGLineStrip( doc, [ VEC3_ZERO, VEC3_XN70 ], this.projector_ );
    this.xnAxis_.element.classList.add( className( 'axisn' ) );
    this.axesElem_.appendChild( this.xnAxis_.element );

    this.ynAxis_ = new SVGLineStrip( doc, [ VEC3_ZERO, VEC3_YN70 ], this.projector_ );
    this.ynAxis_.element.classList.add( className( 'axisn' ) );
    this.axesElem_.appendChild( this.ynAxis_.element );

    this.znAxis_ = new SVGLineStrip( doc, [ VEC3_ZERO, VEC3_ZN70 ], this.projector_ );
    this.znAxis_.element.classList.add( className( 'axisn' ) );
    this.axesElem_.appendChild( this.znAxis_.element );

    // front arc
    this.xArcF_ = new SVGLineStrip( doc, arcArray, this.projector_ );
    this.xArcF_.element.classList.add( className( 'arcx' ) );
    this.svgElem_.appendChild( this.xArcF_.element );

    this.yArcF_ = new SVGLineStrip( doc, arcArray, this.projector_ );
    this.yArcF_.element.classList.add( className( 'arcy' ) );
    this.svgElem_.appendChild( this.yArcF_.element );

    this.zArcF_ = new SVGLineStrip( doc, arcArray, this.projector_ );
    this.zArcF_.element.classList.add( className( 'arcz' ) );
    this.svgElem_.appendChild( this.zArcF_.element );

    this.xArcFC_ = new SVGLineStrip( doc, arcArray, this.projector_ );
    this.xArcFC_.element.classList.add( className( 'arcc' ) );
    this.svgElem_.appendChild( this.xArcFC_.element );

    this.yArcFC_ = new SVGLineStrip( doc, arcArray, this.projector_ );
    this.yArcFC_.element.classList.add( className( 'arcc' ) );
    this.svgElem_.appendChild( this.yArcFC_.element );

    this.zArcFC_ = new SVGLineStrip( doc, arcArray, this.projector_ );
    this.zArcFC_.element.classList.add( className( 'arcc' ) );
    this.svgElem_.appendChild( this.zArcFC_.element );

    // roll arc
    this.rArc_ = new SVGLineStrip( doc, arcArrayR, this.projector_ );
    this.rArc_.element.classList.add( className( 'arcr' ) );
    this.rArc_.setRotation( QUAT_IDENTITY );
    this.svgElem_.appendChild( this.rArc_.element );

    this.rArcC_ = new SVGLineStrip( doc, arcArrayR, this.projector_ );
    this.rArcC_.element.classList.add( className( 'arcc' ) );
    this.rArcC_.setRotation( QUAT_IDENTITY );
    this.svgElem_.appendChild( this.rArcC_.element );

    // labels
    const labelsElem = doc.createElementNS( SVG_NS, 'g' );
    svgElem.classList.add( className( 'labels' ) );
    this.svgElem_.appendChild( labelsElem );
    this.labelsElem_ = labelsElem;

    this.xLabel = createLabel( doc, 'labelcirclex', 'X' );
    this.labelsElem_.appendChild( this.xLabel );

    this.yLabel = createLabel( doc, 'labelcircley', 'Y' );
    this.labelsElem_.appendChild( this.yLabel );

    this.zLabel = createLabel( doc, 'labelcirclez', 'Z' );
    this.labelsElem_.appendChild( this.zLabel );

    this.xnLabel = createLabel( doc, 'labelcirclen', '-X' );
    this.labelsElem_.appendChild( this.xnLabel );

    this.ynLabel = createLabel( doc, 'labelcirclen', '-Y' );
    this.labelsElem_.appendChild( this.ynLabel );

    this.znLabel = createLabel( doc, 'labelcirclen', '-Z' );
    this.labelsElem_.appendChild( this.znLabel );

    // arc hover
    const onHoverXArc = (): void => {
      this.xArcB_.element.classList.add( className( 'arcx_hover' ) );
      this.xArcF_.element.classList.add( className( 'arcx_hover' ) );
    };
    const onLeaveXArc = (): void => {
      this.xArcB_.element.classList.remove( className( 'arcx_hover' ) );
      this.xArcF_.element.classList.remove( className( 'arcx_hover' ) );
    };

    this.xArcBC_.element.addEventListener( 'mouseenter', onHoverXArc );
    this.xArcBC_.element.addEventListener( 'mouseleave', onLeaveXArc );
    this.xArcFC_.element.addEventListener( 'mouseenter', onHoverXArc );
    this.xArcFC_.element.addEventListener( 'mouseleave', onLeaveXArc );

    const onHoverYArc = (): void => {
      this.yArcB_.element.classList.add( className( 'arcy_hover' ) );
      this.yArcF_.element.classList.add( className( 'arcy_hover' ) );
    };
    const onLeaveYArc = (): void => {
      this.yArcB_.element.classList.remove( className( 'arcy_hover' ) );
      this.yArcF_.element.classList.remove( className( 'arcy_hover' ) );
    };

    this.yArcBC_.element.addEventListener( 'mouseenter', onHoverYArc );
    this.yArcBC_.element.addEventListener( 'mouseleave', onLeaveYArc );
    this.yArcFC_.element.addEventListener( 'mouseenter', onHoverYArc );
    this.yArcFC_.element.addEventListener( 'mouseleave', onLeaveYArc );

    const onHoverZArc = (): void => {
      this.zArcB_.element.classList.add( className( 'arcz_hover' ) );
      this.zArcF_.element.classList.add( className( 'arcz_hover' ) );
    };
    const onLeaveZArc = (): void => {
      this.zArcB_.element.classList.remove( className( 'arcz_hover' ) );
      this.zArcF_.element.classList.remove( className( 'arcz_hover' ) );
    };

    this.zArcBC_.element.addEventListener( 'mouseenter', onHoverZArc );
    this.zArcBC_.element.addEventListener( 'mouseleave', onLeaveZArc );
    this.zArcFC_.element.addEventListener( 'mouseenter', onHoverZArc );
    this.zArcFC_.element.addEventListener( 'mouseleave', onLeaveZArc );

    const onHoverRArc = (): void => {
      this.rArc_.element.classList.add( className( 'arcr_hover' ) );
    };
    const onLeaveRArc = (): void => {
      this.rArc_.element.classList.remove( className( 'arcr_hover' ) );
    };

    this.rArcC_.element.addEventListener( 'mouseenter', onHoverRArc );
    this.rArcC_.element.addEventListener( 'mouseleave', onLeaveRArc );

    config.value.emitter.on( 'change', this.onValueChange_ );
    this.value = config.value;

    config.mode.emitter.on( 'change', this.onModeChange_ );
    this.mode_ = config.mode;

    this.update_();
  }

  public get allFocusableElements(): HTMLElement[] {
    return [ this.padElement ];
  }

  private update_(): void {
    const q = this.value.rawValue.quat.normalized;

    // rotate axes
    this.xAxis_.setRotation( q );
    this.yAxis_.setRotation( q );
    this.zAxis_.setRotation( q );
    this.xnAxis_.setRotation( q );
    this.ynAxis_.setRotation( q );
    this.znAxis_.setRotation( q );

    // """z-sort""" axes
    const xp = VEC3_XP.applyQuaternion( q );
    const yp = VEC3_YP.applyQuaternion( q );
    const zp = VEC3_ZP.applyQuaternion( q );
    const xn = xp.negated;
    const yn = yp.negated;
    const zn = zp.negated;

    [
      { el: this.xAxis_.element, v: xp },
      { el: this.yAxis_.element, v: yp },
      { el: this.zAxis_.element, v: zp },
      { el: this.xnAxis_.element, v: xn },
      { el: this.ynAxis_.element, v: yn },
      { el: this.znAxis_.element, v: zn },
    ]
      .map( ( { el, v } ) => {
        this.axesElem_.removeChild( el );
        return { el, v };
      } )
      .sort( ( a, b ) => a.v.z - b.v.z )
      .forEach( ( { el } ) => {
        this.axesElem_.appendChild( el );
      } );

    // rotate arcs
    this.xArcB_.setRotation( createArcRotation( xp, VEC3_ZN ) );
    this.yArcB_.setRotation( createArcRotation( yp, VEC3_ZN ) );
    this.zArcB_.setRotation( createArcRotation( zp, VEC3_ZN ) );
    this.xArcBC_.setRotation( createArcRotation( xp, VEC3_ZN ) );
    this.yArcBC_.setRotation( createArcRotation( yp, VEC3_ZN ) );
    this.zArcBC_.setRotation( createArcRotation( zp, VEC3_ZN ) );
    this.xArcF_.setRotation( createArcRotation( xp, VEC3_ZP ) );
    this.yArcF_.setRotation( createArcRotation( yp, VEC3_ZP ) );
    this.zArcF_.setRotation( createArcRotation( zp, VEC3_ZP ) );
    this.xArcFC_.setRotation( createArcRotation( xp, VEC3_ZP ) );
    this.yArcFC_.setRotation( createArcRotation( yp, VEC3_ZP ) );
    this.zArcFC_.setRotation( createArcRotation( zp, VEC3_ZP ) );

    // rotate labels
    [
      { el: this.xLabel, v: VEC3_XP70 },
      { el: this.yLabel, v: VEC3_YP70 },
      { el: this.zLabel, v: VEC3_ZP70 },
      { el: this.xnLabel, v: VEC3_XN70 },
      { el: this.ynLabel, v: VEC3_YN70 },
      { el: this.znLabel, v: VEC3_ZN70 },
    ].forEach( ( { el, v } ) => {
      const [ x, y ] = this.projector_.project( v.applyQuaternion( q ) );
      el.setAttributeNS( null, 'transform', `translate( ${ x }, ${ y } )` );
    } );

    // """z-sort""" labels
    [
      { el: this.xLabel, v: xp },
      { el: this.yLabel, v: yp },
      { el: this.zLabel, v: zp },
      { el: this.xnLabel, v: xn },
      { el: this.ynLabel, v: yn },
      { el: this.znLabel, v: zn },
    ].map( ( { el, v } ) => {
      this.labelsElem_.removeChild( el );
      return { el, v };
    } )
      .sort( ( a, b ) => a.v.z - b.v.z )
      .forEach( ( { el } ) => {
        this.labelsElem_.appendChild( el );
      } );
  }

  private onValueChange_(): void {
    this.update_();
  }

  private onFoldableChange_(): void {
    this.update_();
  }

  private onModeChange_(): void {
    const mode = this.mode_.rawValue;

    const x = mode === 'angle-x' ? 'add' : 'remove';
    const y = mode === 'angle-y' ? 'add' : 'remove';
    const z = mode === 'angle-z' ? 'add' : 'remove';
    const r = mode === 'angle-r' ? 'add' : 'remove';

    this.xArcB_.element.classList[ x ]( className( 'arcx_active' ) );
    this.yArcB_.element.classList[ y ]( className( 'arcy_active' ) );
    this.zArcB_.element.classList[ z ]( className( 'arcz_active' ) );
    this.xArcF_.element.classList[ x ]( className( 'arcx_active' ) );
    this.yArcF_.element.classList[ y ]( className( 'arcy_active' ) );
    this.zArcF_.element.classList[ z ]( className( 'arcz_active' ) );
    this.rArc_.element.classList[ r ]( className( 'arcr_active' ) );
  }
}
