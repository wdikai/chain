export class Exception extends Error {
    status: number;
    baseRoute: string;

    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}