import * as express from 'express';
import { ChainNode } from '../../chain/chain-node';

export class PearsController {
    private readonly blockchain: ChainNode;

    constructor(blockchain: ChainNode) {
        this.blockchain = blockchain;
    }

    get(req, res) {
        const pears = this.blockchain.node.sockets.map(socket => ({
            url: `${socket.remoteAddress}:${socket.remotePort}`,
            port: socket.remotePort,
            host: socket.remoteAddress
        }))
        res.json({
            pears
        });
    }

    post(req, res) {
        this.blockchain.addPear(req.body.port, req.body.host);
        res.json({
            pear: {
                url: `${req.body.host}:${req.body.port}`,
                port: req.body.port,
                host: req.body.host
            }
        });
    }
}