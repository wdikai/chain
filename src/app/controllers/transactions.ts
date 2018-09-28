import * as express from 'express';
import { ChainNode } from '../../chain/chain-node';
import { Transaction } from '../../chain/transaction/transaction';

export class TransactionsController {
    private readonly blockchain: ChainNode;

    constructor(blockchain: ChainNode) {
        this.blockchain = blockchain;
    }

    post(req, res) {
        const wallet = this.blockchain.wallet;
        const transaction = new Transaction();
        const amount = parseFloat(req.body.amount);
        const from = req.body.from;
        const recipient = req.body.recipient;
        const coins = wallet.getTokens(req.body.tokens, from);
        const cashBack = coins.amount - amount;
        if(cashBack < 0) {
            return res.status(402).json({error: true, message: 'Sum price of this tokents less then you want pay'})
        }

        transaction.addInputs(coins.tokens);
        transaction.addOutput(recipient, amount);
        if(cashBack > 0) {
            transaction.addOutput(wallet.id, cashBack);
        }

        this.blockchain.addTransaction(transaction);
        res.json({ transaction });
    }
}