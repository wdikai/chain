import { Chain } from "./chain";
import { Node } from "../net/node";
import { Block } from "./block";
import { Transaction } from "./transaction/transaction";
import { Wallet } from "./wallet";
import { TransactionInput } from "./transaction/transaction-input";
import { TransactionOutput } from "./transaction/transaction-output";
import { Exception } from "../app/exception";
import { MessageType } from './message-type';

export interface ChainNodeOptions {
    port?: string;
    difficulty?: number;
    wallet?: string;
}

export class ChainNode {
    tnxIds: Set<string> = new Set();
    transactions: Transaction[];
    chain: Chain<Transaction[]>;
    node: Node;
    wallet: Wallet;
    test: MessageType;

    constructor(options: ChainNodeOptions) {
        this.transactions = [];
        this.node = new Node(options.port);
        this.chain = new Chain(options.difficulty);
        this.wallet = new Wallet(options.wallet, this.chain);
    }

    addPear(port, host?: string): ChainNode {
        this.node.connectTo(port, host);
        return this;
    }

    listen(): ChainNode {
        this.node.listen(() => this.init());
        return this;
    }

    addTransaction(transaction: Transaction): void {
        if(!transaction.isValid) {
            throw new Exception('Invalid transaction');
        }

        if (!this.tnxIds.has(transaction.id)) {
            this.tnxIds.add(transaction.id);
            this.transactions.push(transaction);
            this.node.broadcast({
                type: MessageType.NewTransaction,
                payload: transaction
            });
        }
    }

    mine(): Block<any> {
        let transactions, block;
        this.addTransaction(Transaction.createUnspentTransaction(this.wallet.id));
        transactions = this.transactions;
        this.transactions = [];

        block = this.chain.addBlock(transactions);
        this.wallet.analyzeBlock(block);
        return block;
    }

    private init(): void {
        console.log(`[${this.node.port}] Chain was running`)
        this.node.messageHandler.on(MessageType.NewTransaction, (message) => this.handleNewTransaction(message.payload));
        this.node.messageHandler.on(MessageType.QueryChain, (message, socket) => this.sendChain(socket));
        this.node.messageHandler.on(MessageType.Chain, (message) => this.loadChain(message.payload));
        this.queryChain();
    }

    private queryChain(): void {
        this.node.broadcast<any>({
            type: MessageType.QueryChain
        });
    }

    private handleNewTransaction(transaction: Transaction): void {
        const tnx = new Transaction(transaction.id);
        transaction.outputs.forEach(output => tnx.addOutput(output.walletId, output.amount, output.id));
        transaction.inputs.forEach((input: TransactionInput) => tnx.addInput(
            new TransactionOutput(input.output.walletId, input.output.amount, input.output.tnxId, input.output.id)
        ));
        this.addTransaction(tnx);
    }

    private sendChain(socket): void {
        if (!this.chain.isValid) {
            return this.queryChain();
        }

        this.node.sendTo(socket, {
            type: MessageType.Chain,
            payload: this.chain.blocks
        })
    }

    private loadChain(blocks): void {
        const chainChanged = this.chain.replaceChain(blocks);
        if(chainChanged) this.wallet.analyzeAllChain();
    }
}