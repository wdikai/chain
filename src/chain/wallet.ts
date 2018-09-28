import { Chain } from "./chain";
import { TokenUtils } from "../utils/token";
import { Transaction } from "./transaction/transaction";
import { TransactionInput } from "./transaction/transaction-input";
import { TransactionOutput } from "./transaction/transaction-output";
import { Exception } from "../app/exception";

export class Wallet {
    id: string;
    chain: Chain<Transaction[]>;

    totalAmount: number;
    allTokens: TransactionOutput[];

    myAmount: number;
    myTokens: TransactionOutput[];

    constructor(wallet: string, chain: Chain<Transaction[]>) {
        this.id = wallet;
        this.chain = chain;
        this.resetValet();
    }

    resetValet(): void {
        this.allTokens = [];
        this.myTokens = [];

        this.totalAmount = TokenUtils.calculateAmount(this.allTokens);
        this.myAmount = TokenUtils.calculateAmount(this.myTokens);
    }

    getTokensByWallet(walletId?: string): any {
        let tokens = this.allTokens;

        if (walletId === this.id) {
            return {
                tokens: this.myTokens,
                amount: this.myAmount
            };
        }

        if (walletId) {
            tokens = tokens.filter(token => token.walletId === walletId);
        }

        return {
            tokens,
            amount: TokenUtils.calculateAmount(tokens)
        };
    }

    getTokens(outputIds: string[], walletId?: string) {
        const tokens = outputIds.map(outputId => {
            const output = this.allTokens.find(output => output.id === outputId);
            if (!output) {
                throw new Exception('Token not found in your wallet');
            }

            if (walletId && output.walletId !== walletId) {
                throw new Exception('Token from another wallet');
            }

            return output;
        });

        return {
            tokens,
            amount: TokenUtils.calculateAmount(tokens)
        }
    }

    analyzeAllChain(): void {
        if (!this.chain.isValid) {
            this.resetValet();
            return;
        }

        this.chain.blocks.forEach(block => this.analyzeBlock(block));
        this.totalAmount = TokenUtils.calculateAmount(this.allTokens);
        this.myAmount = TokenUtils.calculateAmount(this.myTokens);
    }

    analyzeBlock(block) {
        if(!block.data) return;
        
        block.data.forEach((tnx: Transaction) => {
            tnx.inputs.forEach((input: TransactionInput) => this.releaseOutput(input.output));
            tnx.outputs.forEach((output: TransactionOutput) => this.addOutput(output));
        });
    }

    private addOutput(output: TransactionOutput) {
        this.allTokens.push(output);
        this.totalAmount += output.amount;

        if (output.walletId === this.id) {
            this.myTokens.push(output);
            this.myAmount += output.amount;
        }
    }

    private releaseOutput(output: TransactionOutput) {
        this.allTokens = this.allTokens.filter(free => free.id !== output.id);
        this.totalAmount -= output.amount;

        if (output.walletId === this.id) {
            this.myTokens = this.myTokens.filter(free => free.id !== output.id);
            this.myAmount -= output.amount;
        }
    }
}