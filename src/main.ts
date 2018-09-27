import { ChainNode } from "./chain/chain-node";
import { Application } from "./app/application";

const CHAIN_PORT = process.env.CHAIN_PORT || '9110';
const PORT = process.env.PORT || '8080';
const PEAR = process.env.PEAR;
console.log(process.env);

const blockchain = new ChainNode({port: CHAIN_PORT, difficulty: 5}).listen();
if(PEAR) {
    const [host, port] = PEAR.split(':');
    blockchain.addPear(port, host);
}
const application = new Application(blockchain);
application.configure();
application.listen(PORT);

