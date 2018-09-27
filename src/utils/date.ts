export class DateUtil {
    static get now(): number {
        return Math.floor(Date.now() / 1000);
    }
}
