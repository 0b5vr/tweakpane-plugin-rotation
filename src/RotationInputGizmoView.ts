import { ClassName, SVG_NS, Value, View } from '@tweakpane/core';
import { PointProjector } from './PointProjector';
import { Quaternion } from './Quaternion';
import { SVGLineStrip } from './SVGLineStrip';
import { Vector3 } from './Vector3';
import { createArcRotation } from './createArcRotation';
import { createArcVerticesArray } from './createArcVerticesArray';
import type { RotationInputGizmoViewConfig } from './RotationInputGizmoViewConfig';

const className = ClassName( 'rotationgizmo' );

const VEC3_ZERO = new Vector3( 0.0, 0.0, 0.0 );
const VEC3_XP = new Vector3( 1.0, 0.0, 0.0 );
const VEC3_YP = new Vector3( 0.0, 1.0, 0.0 );
const VEC3_ZP = new Vector3( 0.0, 0.0, 1.0 );
const VEC3_XP80 = new Vector3( 0.8, 0.0, 0.0 );
const VEC3_YP80 = new Vector3( 0.0, 0.8, 0.0 );
const VEC3_ZP80 = new Vector3( 0.0, 0.0, 0.8 );
const VEC3_ZN = new Vector3( 0.0, 0.0, -1.0 );

export class RotationInputGizmoView implements View {
  public readonly element: HTMLElement;
  public readonly padElement: HTMLDivElement;
  public readonly value: Value<Quaternion>;
  private readonly mode_: Value<'free' | 'x' | 'y' | 'z'>;
  private readonly svgElem_: Element;
  private readonly axesElem_: Element;
  private readonly projector_: PointProjector;
  private readonly xAxis_: SVGLineStrip;
  private readonly yAxis_: SVGLineStrip;
  private readonly zAxis_: SVGLineStrip;
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

  public get xArcBElement(): SVGPathElement { return this.xArcBC_.element; }
  public get yArcBElement(): SVGPathElement { return this.yArcBC_.element; }
  public get zArcBElement(): SVGPathElement { return this.zArcBC_.element; }
  public get xArcFElement(): SVGPathElement { return this.xArcFC_.element; }
  public get yArcFElement(): SVGPathElement { return this.yArcFC_.element; }
  public get zArcFElement(): SVGPathElement { return this.zArcFC_.element; }

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

    const arcArray = createArcVerticesArray( 0.0, Math.PI, 32, 'x', 'y' );

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

    this.xAxis_ = new SVGLineStrip( doc, [ VEC3_ZERO, VEC3_XP80 ], this.projector_ );
    this.xAxis_.element.classList.add( className( 'axisx' ) );
    this.axesElem_.appendChild( this.xAxis_.element );

    this.yAxis_ = new SVGLineStrip( doc, [ VEC3_ZERO, VEC3_YP80 ], this.projector_ );
    this.yAxis_.element.classList.add( className( 'axisy' ) );
    this.axesElem_.appendChild( this.yAxis_.element );

    this.zAxis_ = new SVGLineStrip( doc, [ VEC3_ZERO, VEC3_ZP80 ], this.projector_ );
    this.zAxis_.element.classList.add( className( 'axisz' ) );
    this.axesElem_.appendChild( this.zAxis_.element );

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
    const q = this.value.rawValue.normalized;

    // rotate axes
    this.xAxis_.setRotation( q );
    this.yAxis_.setRotation( q );
    this.zAxis_.setRotation( q );

    // """z-sort"""
    const xp = VEC3_XP.applyQuaternion( q );
    const yp = VEC3_YP.applyQuaternion( q );
    const zp = VEC3_ZP.applyQuaternion( q );

    [
      { el: this.xAxis_.element, v: xp },
      { el: this.yAxis_.element, v: yp },
      { el: this.zAxis_.element, v: zp },
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
  }

  private onValueChange_(): void {
    this.update_();
  }

  private onFoldableChange_(): void {
    this.update_();
  }

  private onModeChange_(): void {
    const mode = this.mode_.rawValue;

    const x = mode === 'x' ? 'add' : 'remove';
    const y = mode === 'y' ? 'add' : 'remove';
    const z = mode === 'z' ? 'add' : 'remove';

    this.xArcB_.element.classList[ x ]( className( 'arcx_active' ) );
    this.yArcB_.element.classList[ y ]( className( 'arcy_active' ) );
    this.zArcB_.element.classList[ z ]( className( 'arcz_active' ) );
    this.xArcF_.element.classList[ x ]( className( 'arcx_active' ) );
    this.yArcF_.element.classList[ y ]( className( 'arcy_active' ) );
    this.zArcF_.element.classList[ z ]( className( 'arcz_active' ) );
  }
}