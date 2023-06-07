import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

@Schema({
  timestamps: true,
})
export class App {
  @Prop()
  title: string;

  @Prop()
  token?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User', required: true })
  user: string;
}

export const AppsSchema = SchemaFactory.createForClass(App);