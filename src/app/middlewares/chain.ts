import * as express from 'express';
import { ChainNode } from '../../chain/chain-node';

export class ChainMiddleware {
    private readonly blockchain: ChainNode;

    constructor(blockchain: ChainNode) {
        this.blockchain = blockchain;
    }

    getChain(req, res) {
        res.json({
            blocks: this.blockchain.chain.blocks
        });
    }

    mineBlock(req, res) {
        const block = this.blockchain.newBlock(req.body);
        res.json({ block });
    }
}