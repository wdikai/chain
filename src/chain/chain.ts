import { DateUtil } from "../utils/date";
import { CryptoUtils } from "../utils/crypto";
import { Block } from "./block";

export class Chain < T > {
    blocks: Block < T > [];
    private difficulty: number;

    constructor(difficulty: number = 1) {
        this.blocks = [Block.generateGenesis < T > ()];
        this.difficulty = difficulty;
    }

    get first(): Block < T > {
        return this.blocks[0];
    }

    get latest(): Block < T > {
        const lastIndex = this.blocks.length - 1;
        return this.blocks[lastIndex];
    }

    get isValid(): boolean {
        return Chain.verifyBlockChain(this.blocks, this.difficulty);
    }

    canAdd(block): boolean {
        const current = this.blocks[block.id];
        const previous = this.blocks[block.id - 1];
        return !current && previous && previous.hash === block.previousHash;
    }

    addBlock(data: T, timestamp = DateUtil.now): Block < T > {
        const block = new Block(
            this.latest.id + 1,
            data,
            this.latest.hash,
            timestamp,
            CryptoUtils.generateProofOfWork(this.latest.proof, this.difficulty)
        );
        this.blocks.push(block);

        return block;
    }

    replaceChain(blockList): boolean {
        if (this.blocks.length >= blockList.length) return false;

        const blocks = blockList.map(block => new Block(
            block.id,
            block.data,
            block.previousHash,
            block.timestamp,
            block.proof,
            block.hash,
        ));
        if (Chain.verifyBlockChain(blocks, this.difficulty)) {
            this.blocks = blocks;
            return true;
        }

        return false;
    }

    static verifyBlockChain < T > (blocks: Block < T > [], difficulty: number) {
        const first = blocks[0];
        if (!first || !first.equal(Block.generateGenesis())) {
            return false;
        }

        return !blocks.some((block, index, blocks) => {
            let previous;
            if (!index) {
                return false;
            }

            previous = blocks[index - 1];

            return (block.hash !== block.genHash() ||
                block.previousHash !== previous.hash ||
                !CryptoUtils.checkProofOfWork(previous.proof, block.proof, difficulty)
            );
        });
    }
}