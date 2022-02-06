import { ClassName, SVG_NS, Value, View } from '@tweakpane/core';
import { PointProjector } from './PointProjector';
import { Rotation } from './Rotation';
import { SVGLineStrip } from './SVGLineStrip';
import { createArcVerticesArray } from './createArcVerticesArray';
import type { RotationInputSwatchViewConfig } from './RotationInputSwatchViewConfig';

const className = ClassName( 'rotationswatch' );

export class RotationInputSwatchView implements View {
  public readonly element: HTMLElement;
  public readonly value: Value<Rotation>;
  public readonly buttonElement: HTMLButtonElement;
  private readonly svgElem_: Element;
  private readonly projector_: PointProjector;
  private readonly xArc_: SVGLineStrip;
  private readonly yArc_: SVGLineStrip;
  private readonly zArc_: SVGLineStrip;

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

    // arc
    const arcArrayX = createArcVerticesArray( 0.0, 2.0 * Math.PI, 65, 'y', 'z' );
    this.xArc_ = new SVGLineStrip( doc, arcArrayX, this.projector_ );
    this.xArc_.element.classList.add( className( 'arc' ) );
    svgElem.appendChild( this.xArc_.element );

    const arcArrayY = createArcVerticesArray( 0.0, 2.0 * Math.PI, 65, 'x', 'z' );
    this.yArc_ = new SVGLineStrip( doc, arcArrayY, this.projector_ );
    this.yArc_.element.classList.add( className( 'arc' ) );
    svgElem.appendChild( this.yArc_.element );

    const arcArrayZ = createArcVerticesArray( 0.0, 2.0 * Math.PI, 65, 'x', 'y' );
    this.zArc_ = new SVGLineStrip( doc, arcArrayZ, this.projector_ );
    this.zArc_.element.classList.add( className( 'arc' ) );
    svgElem.appendChild( this.zArc_.element );

    this.update_();
  }

  private update_(): void {
    const q = this.value.rawValue.quat.normalized;

    // rotate axes
    this.xArc_.setRotation( q );
    this.yArc_.setRotation( q );
    this.zArc_.setRotation( q );
  }

  private onValueChange_(): void {
    this.update_();
  }
}
