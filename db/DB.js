class DB {

    // =================================================== Orders  Functions ==============================================

    static orders = [];

    // static orders = [
    //     {
    //       id: "O001",
    //       customerID: "C001",
    //       items: [
    //         { code: "I001", name: "Apple", qty: 5, price: 100, total: 500 },
    //         { code: "I002", name: "Banana", qty: 10, price: 50, total: 500 }
    //       ],
    //       total: 1000,
    //       discount: 100,
    //       subtotal: 900,
    //       cash: 1000,
    //       balance: 100
    //     },
    //     {
    //       id: "O002",
    //       customerID: "C002",
    //       items: [
    //         { code: "I003", name: "Orange", qty: 8, price: 75, total: 600 }
    //       ],
    //       total: 600,
    //       discount: 50,
    //       subtotal: 550,
    //       cash: 600,
    //       balance: 50
    //     }
    //   ];

    static getAllOrders() {
        return this.orders;
    }

    static findOrder(orderId) {
        return this.orders.find(order => order.id === orderId) || null;
    }
    
    static saveOrder(order) {
        try {
        
            if (!order || typeof order !== 'object') {
                throw new Error("Invalid order object");
            }

            this.orders.push(order);
            return true;
        } catch (error) {
            console.error("Error saving order:", error);
            return false;
        }
    }

 
    static generateOrderId() {
        if (this.orders.length === 0) {
            return "O001";
        }
        const lastId = this.orders[this.orders.length - 1].id;
        const lastNum = parseInt(lastId.substring(1));
        return "O" + String(lastNum + 1).padStart(3, "0");
    }

    // =================================================== Customer  Functions ==============================================
   
        // static customers = [];

        static customers = [
            { id: "C001", name: "Anjana Heshan", address: "Elpitiya", salary: 400000 },
            { id: "C002", name: "Tharusha Sandaruwan", address: "Ella", salary: 500000 },
            { id: "C003", name: "Chathura Lakshan", address: "Kurudugaha", salary: 450000 }
        ];
    
       
        static getAllCustomers() {
            return this.customers;
        }
    
        static saveCustomer(customer) {
            if (!customer || typeof customer !== 'object' || !customer.id || !customer.name) {
                throw new Error("Invalid customer object");
            }
            if (this.customers.some(c => c.id === customer.id)) {
                return false;
            }
            this.customers.push(customer);
            return true;
        }
    
        static findCustomer(customerId) {
            return this.customers.find(c => c.id === customerId) || null;
        }
    
    
        static updateCustomer(customer) {
            if (!customer || typeof customer !== 'object' || !customer.id) {
                throw new Error("Invalid customer object");
            }
            const index = this.customers.findIndex(c => c.id === customer.id);
            if (index === -1) {
                return false; 
            }
            this.customers[index] = customer;
            return true;
        }
    
        static deleteCustomer(customerId) {
            const initialLength = this.customers.length;
            this.customers = this.customers.filter(c => c.id !== customerId);
            return this.customers.length !== initialLength;
        }

        static generateCustomerId() {
            if (this.customers.length === 0) {
                return "C001";
            }
            const lastId = this.customers[this.customers.length - 1].id;
            const lastNum = parseInt(lastId.substring(1));
            return "C" + String(lastNum + 1).padStart(3, "0");
        }

    // ========================================================= Item Functions ===================================================
    
        // static items = [];

        static items = [
            { code: "I001", name: "Apple", qty: 500, price: 100.00 },
            { code: "I002", name: "Banana", qty: 250, price: 50.00 },
            { code: "I003", name: "Orange", qty: 300, price: 75.00 }
        ];

        static getAllItems() {
            return this.items;
        }

        static saveItem(item) {
            if (!item || typeof item !== 'object' || !item.code || !item.name) {
                throw new Error("Invalid item object");
            }
            if (this.items.some(i => i.code === item.code)) {
                return false; // Item code already exists
            }
            this.items.push(item);
            return true;
        }

        static findItem(itemCode) {
            return this.items.find(i => i.code === itemCode) || null;
        }

        static updateItem(item) {
            if (!item || typeof item !== 'object' || !item.code) {
                throw new Error("Invalid item object");
            }
            const index = this.items.findIndex(i => i.code === item.code);
            if (index === -1) {
                return false; // Item not found
            }
            this.items[index] = item;
            return true;
        }

        static deleteItem(itemCode) {
            const initialLength = this.items.length;
            this.items = this.items.filter(i => i.code !== itemCode);
            return this.items.length !== initialLength;
        }
    
        static generateItemCode() {
            if (this.items.length === 0) {
                return "I001";
            }
            const lastItem = this.items[this.items.length - 1].code;
            const lastNum = parseInt(lastItem.substring(1));
            return "I" + String(lastNum + 1).padStart(3, "0");
        }
}
