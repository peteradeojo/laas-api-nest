import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes } from 'mongoose';

export enum LogLevels {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
  FATAL = 'fatal',
}

@Schema({
  timestamps: true,
})
export class Log {
  @Prop()
  text: string;

  @Prop({
    enum: LogLevels,
    default: LogLevels.INFO,
  })
  level: string;

  @Prop({
    type: SchemaTypes.ObjectId,
  })
  app: string;

  @Prop({
    required: false
  })
  ip?: string;
}

export const LogsSchema = SchemaFactory.createForClass(Log);
