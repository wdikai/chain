import * as express from 'express';

export class Router {
    api: express.Router;
    baseRoute: string;

    constructor(baseRoute: string) {
        this.baseRoute = baseRoute;
        this.api = express.Router();
    }

    registerController(controller) {
        if(controller.get) this.get(controller);
        if(controller.post) this.post(controller);

        return this;
    }

    get(controller, action = 'get', route = '/') {
        this.api.get(route, this.registerAction(controller[action], controller));
        return this;
    }

    post(controller, action = 'post', route = '/') {
        this.api.post(route, this.registerAction(controller[action], controller));
        return this;
    }

    registerAction(middleware, context) {
        return (req, res, next) => {
            try {
                middleware.apply(context, req, res, next)
            } catch(error) {
                return next(error)
            }
        }
    }

}