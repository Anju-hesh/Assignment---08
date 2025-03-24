class CustomerModel {

    static getAllCustomers() {
        return DB.getAllCustomers();
    }

    static saveCustomer(customer) {
        return DB.saveCustomer(customer);
    }

    static findCustomer(customerId) {
        return DB.findCustomer(customerId);
    }

    static updateCustomer(customer) {
        return DB.updateCustomer(customer);
    }

    static deleteCustomer(customerId) {
        return DB.deleteCustomer(customerId);
    }

    static generateCustomerId() {
        return DB.generateCustomerId();
    }
}