import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway(9000, {
    cors: {
        origin: '*',
    },
    namespace: 'events',
})
export class EventsGateway {
    constructor() {
        console.log('socket gateway');
    }
    @WebSocketServer()
    server: Server;

    @SubscribeMessage('events')
    handleEvent(@MessageBody('id') id: number): number {
        return id;
    }
}
