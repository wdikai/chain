import * as express from 'express';
import * as bodyParser from 'body-parser';
import { ChainMiddleware } from './middlewares/chain';
import { PearsMiddleware } from './middlewares/pears';
import { ChainNode } from '../chain/chain-node';

export class Application {
    app: express.Express;
    blockchain: ChainNode;

    constructor(blockchain: ChainNode) {
        this.app = express();
        this.blockchain = blockchain;
    }

    configure() {
        const router = express.Router();
        const pears = new PearsMiddleware(this.blockchain);
        const chain = new ChainMiddleware(this.blockchain);

        router
            .route('/chain')
            .get((req, res) => chain.getChain(req, res))
            .post((req, res) => chain.mineBlock(req, res));

        router
            .route('/pears')
            .get((req, res) => pears.getPears(req, res))
            .post((req, res) => pears.addPear(req, res));

            this.app.use(bodyParser.raw());
            this.app.use(bodyParser.json());
            this.app.use(router);
    }

    listen(port = '8080') {
        this.app.listen(port, () => console.log('Server was running on port', port));
    }
}