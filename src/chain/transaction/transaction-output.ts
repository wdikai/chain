import * as uuid from "uuid";
import { TokenInterface } from "./token-interface";


export class TransactionOutput implements TokenInterface  {
    id: string;
    walletId: string;
    tnxId: string;
    amount: number;

    constructor(wallet: string, amount: number, tnxId: string, id: string = uuid.v4()) {
        this.id = id;
        this.walletId = wallet;
        this.tnxId = tnxId;
        this.amount = amount;
    }
}