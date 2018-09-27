import { createHash } from 'crypto'

export class CryptoUtils {
    static createHash(...datas: string[]) {
        const hash = createHash('sha256');
        datas.forEach(data => hash.update(data));

        return hash.digest('hex');
    }

    static generateProofOfWork(previous: number = 0, difficulty: number = 1): number {
        let proof = 0;
        while (!CryptoUtils.checkProofOfWork(previous, proof, difficulty)) proof++;
        return proof;
    }

    static checkProofOfWork(previous, current, difficulty = 1) {
        const hash = CryptoUtils.createHash(previous.toString(), current.toString());
        const start = hash.substring(0, difficulty)
        const test = Array(difficulty + 1).join("0")
        return start === test;
    }
}