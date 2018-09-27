import { CryptoUtils } from "../utils/crypto";
import { DateUtil } from "../utils/date";

export class Block < T > {
    readonly id: number;
    readonly data: T;
    readonly timestamp: number;
    readonly proof: number;

    readonly hash: string;
    readonly previousHash: string;

    constructor(id: number, data: T, previousHash = '', timestamp = DateUtil.now, proof = 0, hash: string = '') {
        this.id = id;
        this.data = data;
        this.timestamp = timestamp;
        this.previousHash = previousHash;
        this.proof = proof;
        this.hash = hash || this.genHash();
    }

    genHash(): string {
        return CryptoUtils.createHash(
            this.id.toString(),
            this.timestamp.toString(),
            JSON.stringify(this.data),
            this.previousHash
        );
    }

    equal(block): boolean {
        return (
            this.id === block.id &&
            this.data === block.data &&
            this.timestamp === block.timestamp &&
            this.previousHash === block.previousHash &&
            this.hash === block.hash
        );
    }

    static generateGenesis < T > (): Block < T > {
        return new Block < T > (0, null, "", 0);
    }
}