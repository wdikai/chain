import {createServer, createConnection, Socket, Server, NetConnectOpts, TcpNetConnectOpts} from 'net';
import {EventEmitter} from 'events';

export interface Message<T> {
    type: string;
    payload?: T;
};

export class Node {
    port: string;

    sockets: Socket[];
    host: Server;

    messageHandler: EventEmitter;

    constructor(port: string = '9110') {
        this.sockets = [];
        this.host = createServer((socket => this.addSocket(socket)))
        this.port = port;
        this.messageHandler = new EventEmitter();
    }

    conectTo(port, host = '127.0.0.1'): Node  {
        console.log(`[${this.port}] Conect to ${host}:${port}`)
        const socket = createConnection({ port, host });
        return this.addSocket(socket);
    }

    addSocket(socket: Socket): Node {
        socket.on('connect', () => {
            console.log(`[${this.port}] Socket has conected ${socket.localAddress}`)
        });

        socket.on('data', (data: string) => {
            try{
                const message: Message<any> = JSON.parse(data);
                this.messageHandler.emit(message.type, message, socket);
                console.log(`[${this.port}] Has new message ${data}`)
            } catch (error) {
                console.log('Invalid Message from node', socket.remoteAddress, ':', socket.remotePort);
            }
        })
        socket.on('close', () => this.sockets = this.sockets.filter(s => s !== socket));
        this.sockets.push(socket);

        return this;
    }

    broadcast<T>(data: Message<T>): Node  {
        this.sockets.forEach(socket => this.sendTo(socket, data));
        return this;
    }

    sendTo<T>(socket: Socket, data: Message<T>): Node  {
        socket.write(JSON.stringify(data));
        return this;
    }

    listen(callback?: Function): Node  {
        this.host.listen(this.port, callback);
        return this;
    }
}