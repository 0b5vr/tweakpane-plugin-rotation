import { RotationInputSwatchView } from './RotationInputSwatchView';
import type { Controller, Value, ViewProps } from '@tweakpane/core';
import type { Quaternion } from './Quaternion';
import type { RotationInputSwatchControllerConfig } from './RotationInputSwatchControllerConfig';

export class RotationInputSwatchController implements Controller<RotationInputSwatchView> {
  public readonly value: Value<Quaternion>;
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
