import * as uuid from 'uuid';
import { TokenUtils } from '../../utils/token';
import { TransactionInput } from './transaction-input';
import { TransactionOutput } from './transaction-output';
import { Exception } from '../../app/exception';

const UTO_AMOUNT = 0.1;

export class Transaction {
    readonly id: string;
    readonly isUTO: boolean;
    readonly inputs: TransactionInput[];
    readonly outputs: TransactionOutput[];

    constructor(id = uuid.v4(), isUTO = false) {
        this.id = id;
        this.isUTO = isUTO;
        this.inputs = [];
        this.outputs = [];
    }

    get isValid(): boolean {
        const inputAmount = TokenUtils.calculateAmount(this.inputs);
        const outputAmount = TokenUtils.calculateAmount(this.outputs);

        return this.isUTO ? !inputAmount && outputAmount === UTO_AMOUNT: inputAmount >= outputAmount;
    }

    addInput(output: TransactionOutput) {
        this.inputs.push(new TransactionInput(output, this.id));
    }

    addInputs(outputs: TransactionOutput[]) {
        outputs.forEach(output => this.addInput(output));
    }

    addOutput(walletId, amount, outputId?: string) {
        if(amount <= 0) {
            throw new Exception('You can sent tokens only with positive amounts');
        }
        const output = new TransactionOutput(walletId, amount, this.id, outputId);
        this.outputs.push(output)
    }

    static createUnspentTransaction(wallet) {
        const tnx = new Transaction(uuid.v4(), true);
        tnx.addOutput(wallet, UTO_AMOUNT);

        return tnx;
    }
}