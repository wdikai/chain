import * as express from 'express';
import { ChainNode } from '../../chain/chain-node';
import { Transaction } from '../../chain/transaction/transaction';
import { Exception } from '../exception';

export class WalletController {
    private readonly blockchain: ChainNode;

    constructor(blockchain: ChainNode) {
        this.blockchain = blockchain;
    }

    get(req, res) {
        const wallet = this.blockchain.wallet;
        res.json({
            outputs: wallet.myTokens,
            amount: wallet.myAmount
        });
    }
}