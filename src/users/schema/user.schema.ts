import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

@Schema()
export class User {
  @Prop({ unique: true }) email: string;
  @Prop() password: string;
  @Prop() name: string;
  @Prop({
    enum: UserRole,
    default: 'user'
  }) role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
