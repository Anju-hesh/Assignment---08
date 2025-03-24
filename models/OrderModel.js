
// class OrderModel {
//   static generateOrderId() {
//     return DB.generateOrderId();
//   }

//   static getAllOrders() {
//     return DB.getAllOrders();
//   }

//   static saveOrder(order){
//     return DB.saveOrder(order);
//   }
// }


class Model {
  static getAllCustomers() {
    return DB.getAllCustomers();
  }

  static getAllItems() {
    return DB.getAllItems();
  }

  static findCustomer(customerId) {
    return DB.findCustomer(customerId);
  }

  static findItem(itemCode) {
    return DB.findItem(itemCode);
  }

  static saveOrder(order) {
    return DB.saveOrder(order);
  }

  static findOrder(orderId) {
    return DB.findOrder(orderId);
  }

  static updateItem(updatedItem) {
    return DB.updateItem(updatedItem);
  }

  static generateOrderId() {
    return DB.generateOrderId();
  }
}