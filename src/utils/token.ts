import { TokenInterface } from "../chain/transaction/token-interface";

export class TokenUtils {
    static calculateAmount(tokens: TokenInterface[]) {
        return tokens.reduce((amount, input) => amount + input.amount, 0);
    }
}