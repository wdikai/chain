import * as express from 'express';
import { ChainNode } from '../../chain/chain-node';

export class ChainController {
    private readonly blockchain: ChainNode;

    constructor(blockchain: ChainNode) {
        this.blockchain = blockchain;
    }

    get(req, res) {
        res.json({
            blocks: this.blockchain.chain.blocks
        });
    }

    post(req, res) {
        const block = this.blockchain.mine();
        res.json({ block });
    }
}