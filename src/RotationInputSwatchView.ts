import { ClassName, SVG_NS, Value, View } from '@tweakpane/core';
import { PointProjector } from './PointProjector';
import { Quaternion } from './Quaternion';
import { Rotation } from './Rotation';
import { SVGLineStrip } from './SVGLineStrip';
import { Vector3 } from './Vector3';
import { createArcRotation } from './createArcRotation';
import { createArcVerticesArray } from './createArcVerticesArray';
import type { RotationInputSwatchViewConfig } from './RotationInputSwatchViewConfig';

const className = ClassName( 'rotationswatch' );

const VEC3_XP = new Vector3( 1.0, 0.0, 0.0 );
const VEC3_YP = new Vector3( 0.0, 1.0, 0.0 );
const VEC3_ZP = new Vector3( 0.0, 0.0, 1.0 );
const QUAT_IDENTITY = new Quaternion( 0.0, 0.0, 0.0, 1.0 );

export class RotationInputSwatchView implements View {
  public readonly element: HTMLElement;
  public readonly value: Value<Rotation>;
  public readonly buttonElement: HTMLButtonElement;
  private readonly svgElem_: Element;
  private readonly projector_: PointProjector;
  private readonly xArc_: SVGLineStrip;
  private readonly yArc_: SVGLineStrip;
  private readonly zArc_: SVGLineStrip;
  private readonly rArc_: SVGLineStrip;

  public constructor( doc: Document, config: RotationInputSwatchViewConfig ) {
    this.onValueChange_ = this.onValueChange_.bind( this );

    config.value.emitter.on( 'change', this.onValueChange_ );
    this.value = config.value;

    this.element = doc.createElement( 'div' );
    this.element.classList.add( className() );
    config.viewProps.bindClassModifiers( this.element );

    const buttonElem = doc.createElement( 'button' );
    buttonElem.classList.add( className( 'b' ) );
    config.viewProps.bindDisabled( buttonElem );
    this.element.appendChild( buttonElem );
    this.buttonElement = buttonElem;

    const svgElem = doc.createElementNS( SVG_NS, 'svg' );
    svgElem.classList.add( className( 'g' ) );
    buttonElem.appendChild( svgElem );
    this.svgElem_ = svgElem;

    this.projector_ = new PointProjector();
    this.projector_.viewport = [ 0, 0, 20, 20 ];

    const arcArray = createArcVerticesArray( 0.0, Math.PI, 33, 'x', 'y' );
    const arcArrayR = createArcVerticesArray( 0.0, 2.0 * Math.PI, 65, 'x', 'y' );

    // arc
    this.rArc_ = new SVGLineStrip( doc, arcArrayR, this.projector_ );
    this.rArc_.element.classList.add( className( 'arcr' ) );
    svgElem.appendChild( this.rArc_.element );
    this.rArc_.setRotation( QUAT_IDENTITY );

    this.xArc_ = new SVGLineStrip( doc, arcArray, this.projector_ );
    this.xArc_.element.classList.add( className( 'arc' ) );
    svgElem.appendChild( this.xArc_.element );

    this.yArc_ = new SVGLineStrip( doc, arcArray, this.projector_ );
    this.yArc_.element.classList.add( className( 'arc' ) );
    svgElem.appendChild( this.yArc_.element );

    this.zArc_ = new SVGLineStrip( doc, arcArray, this.projector_ );
    this.zArc_.element.classList.add( className( 'arc' ) );
    svgElem.appendChild( this.zArc_.element );

    this.update_();
  }

  private update_(): void {
    const q = this.value.rawValue.quat.normalized;

    // rotate axes
    const xp = VEC3_XP.applyQuaternion( q );
    const yp = VEC3_YP.applyQuaternion( q );
    const zp = VEC3_ZP.applyQuaternion( q );

    this.xArc_.setRotation( createArcRotation( xp, VEC3_ZP ) );
    this.yArc_.setRotation( createArcRotation( yp, VEC3_ZP ) );
    this.zArc_.setRotation( createArcRotation( zp, VEC3_ZP ) );
  }

  private onValueChange_(): void {
    this.update_();
  }
}
