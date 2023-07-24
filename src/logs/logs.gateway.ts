import {
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LogsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket): void {
    // console.log('connected ' + socket.id);
  }

  handleDisconnect(socket: Socket): void {
    // console.log('disconnected');
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() socket: Socket, @MessageBody() data: string): void {
    // console.log('joining room ' + data);
    socket.join(data);
  }

  sendLog(appToken: string, log: any): void {
    console.log('sending log to ' + appToken);
    this.server.to(appToken).emit('log', log);
  }
}
