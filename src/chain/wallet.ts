import { Chain } from "./chain";
import { TokenUtils } from "../utils/token";
import { Transaction } from "./transaction/transaction";
import { TransactionInput } from "./transaction/transaction-input";
import { TransactionOutput } from "./transaction/transaction-output";
import { Exception } from "../app/exception";

export class Wallet {
    id: string;
    chain: Chain<Transaction[]>;

    amount: number;
    tokens: TransactionOutput[];

    constructor(wallet: string, chain: Chain<Transaction[]>) {
        this.id = wallet;
        this.chain = chain;
        this.resetValet();
    }

    resetValet(): void {
        this.tokens = [];
        this.calculateAmount()
    }

    calculateAmount(): number {
        return this.amount = TokenUtils.calculateAmount(this.tokens);
    }

    getTokens(outputIds: string[]) {
        const tokens = outputIds.map(outputId => {
            const output = this.tokens.find(output => output.id === outputId);
            if(!output) {
                throw new Exception('Token not found in your wallet');
            }

            return output;
        });

        return {
            tokens,
            amount: TokenUtils.calculateAmount(tokens)
        }
    }

    analyzeAllChain(): void {
        if (this.chain.isValid) {
            this.resetValet();
            return;
        }

        this.chain.blocks.forEach(block => this.analyzeBlock(block));
        this.calculateAmount();
    }

    analyzeBlock(block) {
        block.data.forEach((tnx: Transaction) => {
            tnx.inputs.forEach((input: TransactionInput) => {
                if (input.output.walletId === this.id) {
                    this.releaseOutput(input.output);
                }
            });

            tnx.outputs.forEach((output: TransactionOutput) => {
                if (output.walletId === this.id) {
                    this.addOutput(output);
                }
            });
        });
    }

    private addOutput(output: TransactionOutput) {
        this.tokens.push(output);
        this.amount += output.amount;
    }

    private releaseOutput(output: TransactionOutput) {
        this.tokens = this.tokens.filter(free => free.id !== output.id);
        this.amount -= output.amount;
    }
}