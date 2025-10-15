export class DestinationWarehouse {
    warehouseName: string;
    store: string;
    sendCity: string

    constructor(warehouseName: string, store: string, sendCity: string) {
        this.warehouseName = warehouseName;
        this.store = store;
        this.sendCity = sendCity;
    }
}