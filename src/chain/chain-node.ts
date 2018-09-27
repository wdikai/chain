import { Chain } from "./chain";
import { Node } from "../net/node";
import { Block } from "./block";

enum MessageType {
    NewBlock = 'NewBlock',
        QueryChain = 'QueryChain',
        Chain = 'Chain'
}

export interface NodeOptions {
    port ? : string;
}

export interface ChainOptions {
    difficulty ? : number;
}


export class ChainNode {
    chain: Chain < any > ;
    node: Node;

    constructor(options: NodeOptions & ChainOptions) {
        this.node = new Node(options.port);
        this.chain = new Chain(options.difficulty);
    }

    addPear(port, host ? : string): ChainNode {
        this.node.conectTo(port, host);
        return this;
    }

    listen(): ChainNode {
        this.node.listen(() => this.init());
        return this;
    }

    newBlock(data: any, timestamp ? : number): Block < any > {
        const payload = this.chain.addBlock(data, timestamp);
        this.node.broadcast < any > ({
            type: MessageType.NewBlock,
            payload
        });

        return payload;
    }

    private init(): void {
        console.log(`[${this.node.port}] Chani was running`)
        this.node.messageHandler.on(MessageType.NewBlock, (message) => this.addBlock(message.payload));
        this.node.messageHandler.on(MessageType.QueryChain, (message, socket) => this.sendChain(socket));
        this.node.messageHandler.on(MessageType.Chain, (message) => this.loadChain(message.payload));
        this.queryChain();
    }

    private queryChain(): void  {
        this.node.broadcast < any > ({
            type: MessageType.QueryChain
        });
    }

    private addBlock(block): void  {
        if (!this.chain.isValid) {
            return this.queryChain();
        }

        if (this.chain.canAdd(block)) {
            this.newBlock(block.data, block.timestamp)
        }
    }

    private sendChain(socket): void  {
        if (!this.chain.isValid) {
            return this.queryChain();
        }

        this.node.sendTo(socket, {
            type: MessageType.Chain,
            payload: this.chain.blocks
        })
    }

    private loadChain(blocks): void  {
        this.chain.replaceChain(blocks);
    }
}