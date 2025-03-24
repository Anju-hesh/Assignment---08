class ItemModel {

    static getAllItems() {
        return DB.getAllItems();
    }

    static saveItem(item) {
        return DB.saveItem(item);
    }

    static findItem(itemCode) {
        return DB.findItem(itemCode);
    }

    static updateItem(item) {
        return DB.updateItem(item);
    }

    static deleteItem(itemCode) {
        return DB.deleteItem(itemCode);
    }

    static generateItemCode() {
        return DB.generateItemCode();
    }
}