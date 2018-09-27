import { TokenInterface } from "./token-interface";
import { TransactionOutput } from "./transaction-output";

export class TransactionInput implements TokenInterface {
    output: TransactionOutput;
    tnxId: string;

    constructor(token: TransactionOutput, tnxId: string) {
        this.output = token;
        this.tnxId = tnxId;
    }

    get amount(): number {
        return this.output.amount;
    }
}