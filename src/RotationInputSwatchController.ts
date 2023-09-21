import { RotationInputSwatchView } from './RotationInputSwatchView.js';
import type { Controller, Value, ViewProps } from '@tweakpane/core';
import type { Rotation } from './Rotation.js';
import type { RotationInputSwatchControllerConfig } from './RotationInputSwatchControllerConfig.js';

export class RotationInputSwatchController implements Controller<RotationInputSwatchView> {
  public readonly value: Value<Rotation>;
  public readonly view: RotationInputSwatchView;
  public readonly viewProps: ViewProps;

  public constructor( doc: Document, config: RotationInputSwatchControllerConfig ) {
    this.value = config.value;
    this.viewProps = config.viewProps;

    this.view = new RotationInputSwatchView( doc, {
      value: this.value,
      viewProps: this.viewProps,
    } );
  }
}
