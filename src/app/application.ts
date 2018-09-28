import * as express from 'express';
import * as bodyParser from 'body-parser';

import { Router } from './router';
import { ChainNode } from '../chain/chain-node';

import { ChainController } from './controllers/chain';
import { PearsController } from './controllers/pears';
import { WalletController } from './controllers/wallet';
import { TransactionsController } from './controllers/transactions';
import { Exception } from './exception';

export class Application {
    app: express.Express;
    blockchain: ChainNode;

    constructor(blockchain: ChainNode) {
        this.app = express();
        this.blockchain = blockchain;
    }

    attachRouter(router: Router) {
        this.app.use(router.baseRoute, router.api);
    }

    configure() {
        const router = express.Router();

        const chainRouter = new Router('/chain').registerController(new ChainController(this.blockchain));
        const pearsRouter = new Router('/pears').registerController(new PearsController(this.blockchain));
        const walletRouter = new Router('/wallet').registerController(new WalletController(this.blockchain));
        const transactionsRouter = new Router('/transactions').registerController(new TransactionsController(this.blockchain));

        this.app.use(bodyParser.raw());
        this.app.use(bodyParser.json());
        this.app.use(router);

        this.attachRouter(chainRouter);
        this.attachRouter(pearsRouter);
        this.attachRouter(walletRouter);
        this.attachRouter(transactionsRouter);

        this.app.use(this.errorHandler)
    }

    listen(port = '8080') {
        this.app.listen(port, () => console.log('Server was running on port', port));
    }

    errorHandler(error, req, res, next) {
        if (error instanceof Exception) {
            return res.status(error.status).json({ error: true, message: error.message });
        }

        return res.status(500).json({ 
            error: true, 
            message: error.message,
            stack: error.stack 
        });
    }
}