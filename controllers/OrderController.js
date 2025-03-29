let dashboardUpdaterOrder = {
    orderCount: 0,
    updateOrdersCount: function(count) {
        this.orderCount = count;
        $('.order-box .box-value').text(count);
    }
};

$(document).ready(function () {
    let totalAmount = 0;
    let orderItems = [];
    let orders = [];

    generateOrderId();

    dashboardUpdaterOrder.updateOrdersCount(Model.getAllOrders().length);

    function loadCustomers() {
        let cmb = $('#select-customer');
        cmb.empty();
        let customers = Model.getAllCustomers();
        cmb.append($('<option>').val('').text('Select Customer'));

        if (customers && customers.length > 0) {
            customers.forEach(customer => {
                cmb.append($('<option>').val(customer.id).text(`${customer.id} - ${customer.name}`));
            });
        }
    }

    function loadItems() {
        // let cmb = $('#select-item');
        // cmb.empty();
        // let items = Model.getAllItems();
        // cmb.append($('<option>').val('').text('Select Item'));

        // if (items && items.length > 0) {
        //     items.forEach(item => {
        //         cmb.append($('<option>').val(item.code).text(`${item.code} - ${item.name}`));
        //     });
        // }

        let items = Model.getAllItems();
            $("#select-item").html('<option value=""> Select Item </option>');
            items.forEach(item => {
                $("#select-item").append(
                    `<option value="${item.code}">${item.code} - ${item.name}</option>`
                );
            });
    }

    loadCustomers();
    loadItems();


    $("#orderID").on("input", function() {
        const orderId = $(this).val();
        const idRegex = /^OID-\d{3}$/;
        let isValid = idRegex.test(orderId);
        
        $(this).removeClass("is-invalid is-valid");
        $("#orderIdError").text("");
        $("#select-customer").prop("disabled", false);
    
        if (orderId && !isValid) {
            $(this).addClass("is-invalid");
            $("#orderIdError").text("Order ID must be in format OID-001 (e.g., OID-001)");
            clearCustomerFields();
            return false;
        }
        
        if (orderId && isValid) {
            $(this).addClass("is-valid");
            const existingOrder = orders.find(order => order.id === orderId);
            
            if (existingOrder) {
                $(this).removeClass("is-valid").addClass("is-invalid");
                $("#orderIdError").text("Order ID already exists. Customer selection is prohibited.");
                $("#select-customer").prop("disabled", true);
                // clearCustomerFields();
                isValid = false;
            }
        }
        
        return isValid;
    });

    $("#select-customer").on("change", function () {
        let selectedCustomerId = $(this).val();

        if (selectedCustomerId) {
            const customer = Model.findCustomer(selectedCustomerId);

            if (customer) {
                $("#Oreder_customerID").val(customer.id);
                $("#oreder_customerName").val(customer.name);
                $("#order_customerSalary").val(customer.salary);
                $("#order_customerAddress").val(customer.address);
            } else {
                clearCustomerFields();
                alert("Customer not found!");
            }
        } else {
            clearCustomerFields();
        }
    });

    $("#select-item").on("change", function () {
        let selectItemCode = $(this).val();

        if (selectItemCode) {
            let item = Model.findItem(selectItemCode);

            if (item) {
                $("#order_itemCode").val(item.code);
                $("#order_itemName").val(item.name);
                $("#order_qtyOnHand").val(item.qty);
                $("#order_itemPrice").val(item.price);
            } else {
                clearItemFields();
                alert("Item Not Found");
            }
        } else {
            clearItemFields();
        }
    });

    function clearCustomerFields() {
        $("#select-customer").val("");
        $("#Oreder_customerID").val("");
        $("#oreder_customerName").val("");
        $("#order_customerSalary").val("");
        $("#order_customerAddress").val("");
    }

    function clearItemFields() {
        $("#select-item").val("");
        $("#order_itemCode").val("");
        $("#order_itemName").val("");
        $("#order_qtyOnHand").val("");
        $("#order_itemPrice").val("");
        $("#orderQuantity").val("");
    }


    $("#orderQuantity").on("input" , checkQty);

    function checkQty(){
        const itemCode = $("#order_itemCode").val();
        const itemQty = parseFloat($("#orderQuantity").val());
        const itemInDB = Model.findItem(itemCode);

        if (!itemInDB) {
            alert("Item not found in the database!");
            return;
        }

        if (itemQty > itemInDB.qty) {
            $("#orderQuantityError").text(`Insufficient quantity! Only ${itemInDB.qty} items available.`);
            $("#orderQuantity").addClass("is-invalid");
            return;
        } else if (!Number.isInteger(itemQty)) { 
            $("#orderQuantityError").text("Quantity must be a whole number.");
            $("#orderQuantity").addClass("is-invalid");
            return;
        } else {
            $("#orderQuantityError").text("");
            $("#orderQuantity").removeClass("is-invalid");
        }
    }

    $("#addItemBtn").on("click", function () {
        const itemCode = $("#order_itemCode").val();
        const itemName = $("#order_itemName").val();
        const itemQty = parseFloat($("#orderQuantity").val());
        const itemPrice = parseFloat($("#order_itemPrice").val());
        const customerID = $("#Oreder_customerID").val();

        if (!itemCode || !itemName || !itemQty || !itemPrice || !customerID) {
            alert("Please fill all item details and select a customer!");
            return;
        }

        const itemInDB = Model.findItem(itemCode);
        // if (!itemInDB) {
        //     alert("Item not found in the database!");
        //     return;
        // }

        // if (itemQty > itemInDB.qty) {
        //     $("#orderQuantityError").text(`Insufficient quantity! Only ${itemInDB.qty} items available.`);
        //     return;
        // } else if (!Number.isInteger(itemQty)) { 
        //     $("#orderQuantityError").text("Quantity must be a whole number.");
        //     return;
        // } else {
        //     $("#orderQuantityError").text("");
        // }

        const existingItemIndex = orderItems.findIndex(item => item.code === itemCode);

        if (existingItemIndex !== -1) {
            const existingItem = orderItems[existingItemIndex];
            const newQty = existingItem.qty + itemQty;

            if (newQty > itemInDB.qty) {
                // $("#orderQuantityError").text(`Insufficient quantity! Only ${itemInDB.qty} items available.`);
                // return;

                checkQty();
            }

            orderItems[existingItemIndex].qty = newQty;
            orderItems[existingItemIndex].total = newQty * itemPrice;
            updateItemInTable(itemCode, newQty, newQty * itemPrice);
        } else {
            const total = itemQty * itemPrice;
            orderItems.push({ code: itemCode, name: itemName, qty: itemQty, price: itemPrice, total: total });
            addItemToTable(itemCode, itemName, itemQty, itemPrice, total);
        }

        totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);
        updateTotalDisplay();
        clearItemFields();
    });

    function addItemToTable(code, name, qty, price, total) {
        const newRow = `
            <tr>
                <td>${code}</td>
                <td>${name}</td>
                <td>${price.toFixed(2)}</td>
                <td>${qty}</td>
                <td>${total.toFixed(2)}</td>
            </tr>
        `;
        $("#orderTableBody").append(newRow);
    }

    function updateItemInTable(itemCode, newQty, newTotal) {
        const tableRow = $(`#orderTableBody tr:contains('${itemCode}')`);
        if (tableRow.length > 0) {
            tableRow.find("td:nth-child(4)").text(newQty);
            tableRow.find("td:nth-child(5)").text(newTotal.toFixed(2));
        }
    }

    function updateTotalDisplay() {
        $("#total").text(totalAmount.toFixed(2));
        $("#subtotal").text(totalAmount.toFixed(2));
        // calculateSubtotalAndBalance();
    }

    function calculateSubtotalAndBalance() {
        const discountPercentage = parseFloat($("#discount").val()) || 0;
        const discountAmount = (totalAmount * discountPercentage) / 100;
        const cash = parseFloat($("#cash").val()) || 0;
        const subtotal = totalAmount - discountAmount;
        const balance = cash - subtotal;

        $("#subtotal").text(subtotal.toFixed(2));

        if(cash && Number.isInteger(cash) && cash > subtotal){
            $("#balance").val(balance.toFixed(2));
            $("#cashError").text("");
        }else if ( cash < 0  ){
            $("#cashError").text("Cash Should be a possitive Value ...!");
        }else if( cash.empty || cash < subtotal ){
            $("#cashError").text("Need More Cash ...!");
        }
        else{
            $("#balance").val("");
            $("#cashError").text("");
        }
        // $("#subtotal").text(subtotal.toFixed(2));
    }

    $("#cash, #discount").on("input", function () {
        calculateSubtotalAndBalance();
    });

    $("#purchaseBtn").on("click", function () {
        let customerID = $("#Oreder_customerID").val();
        if (!customerID) {
            alert("Please select a customer.");
            return;
        }

        if (orderItems.length === 0) {
            alert("Please add items to the order.");
            return;
        }

        const cashInput = $("#cash").val();
        if (!cashInput || isNaN(cashInput)) {
            alert("Please enter a valid cash amount.");
            return;
        }
        const cash = parseFloat(cashInput);

        const discountPercentage = parseFloat($("#discount").val()) || 0;
        const discountAmount = (totalAmount * discountPercentage) / 100;
        const subtotal = totalAmount - discountAmount;

        const balance = cash - subtotal;
        if (balance < 0) {
            alert("Insufficient cash! Please provide more cash.");
            return;
        }

        let insufficientItems = orderItems.filter(item => {
            const itemInDB = Model.findItem(item.code);
            return !itemInDB || itemInDB.qty < item.qty;
        });

        if (insufficientItems.length > 0) {
            alert(`Insufficient quantity for items: ${insufficientItems.map(i => i.code).join(", ")}`);
            return;
        }

        const orderId = $("#orderID").val();
        const orderDate = new Date().toISOString().split('T')[0];

        const existingOrder = orders.find(order => order.id === orderId);
        if (existingOrder) {
            alert("Order ID already exists. Please use a unique order ID.");
            return;
        }

        const order = {
            id: orderId,
            date: orderDate,
            customerID: customerID,
            items: [...orderItems],
            total: totalAmount,
            discountPercentage: discountPercentage,
            discountAmount: discountAmount,
            subtotal: subtotal,
            cash: cash,
            balance: balance
        };

        try {
            const isSaved = Model.saveOrder(order);
            if (!isSaved) {
                throw new Error("Failed to save order");
            }
            
            for (const item of orderItems) {
                const itemInDB = Model.findItem(item.code);
                if (!itemInDB) {
                    console.warn(`Item ${item.code} not found in database`);
                    continue;
                }
                
                if (itemInDB.qty < item.qty) {
                    throw new Error(`Insufficient quantity for item ${item.code}`);
                }
                
                const updatedItem = {
                    ...itemInDB,
                    qty: itemInDB.qty - item.qty
                };
                
                const isUpdated = ItemModel.updateItem(updatedItem);
                if (!isUpdated) {
                    throw new Error(`Failed to update item ${item.code}`);
                }
            }
            
            orders.push(order);
            alert("Order saved successfully!");
           
            dashboardUpdaterOrder.updateOrdersCount(Model.getAllOrders().length);
            loadAllItem();
            clearForm();
            
        } catch (error) {
            console.error("Order processing failed:", error);
            alert(`Error: ${error.message}. Please try again.`);
        }



        
    function loadAllItem() {
        let itemTable = $("#item_table_body");
        itemTable.empty();

        let items = ItemModel.getAllItems();

        items.forEach(item => {
            itemTable.append(`
                <tr data-id="${item.code}">
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>${item.price.toFixed(2)}</td>
                </tr>
            `);
        });
    }
});

    function clearForm() {
        clearCustomerFields();
        $("#select-customer").val("");
        $("#select-item").val("");
        clearItemFields();
        $("#orderTableBody").empty();
        totalAmount = 0;
        orderItems = [];
        updateTotalDisplay();
        $("#cash").val("");
        $("#discount").val("");
        $("#balance").val("");
        $("#orderID").val("");
        $("#date").val("");
        generateOrderId();
    }

    function generateOrderId() {
        let orderId = Model.generateOrderId();
        $("#orderID").val(orderId);
    }

    $("#orderID").on("keypress", function (event) {
        if (event.which === 13) {
            const orderId = $(this).val();

            if (!orderId) {
                $("#orderIdError").text("Please enter an Order ID!");
                return;
            }

            const order = Model.findOrder(orderId);

            if (order) {
                displayOrderDetails(order);
                $("#orderIdError").text("");
            } else {
                $("#orderIdError").text("Order not found!");
                clearOrderTable();
                clearCustomerFields();
            }
        }
    });

    function displayOrderDetails(order) {
        const tableBody = $("#orderTableBody");
        tableBody.empty();

        order.items.forEach(item => {
            const row = `
                <tr>
                    <td>${item.code}</td>
                    <td>${item.name}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${item.qty}</td>
                    <td>${item.total.toFixed(2)}</td>
                </tr>
            `;
            tableBody.append(row);
        });

        const customer = Model.findCustomer(order.customerID);
        if (customer) {
            $("#Oreder_customerID").val(customer.id);
            $("#oreder_customerName").val(customer.name);
            $("#order_customerSalary").val(customer.salary);
            $("#order_customerAddress").val(customer.address);
        } else {
            alert("Customer details not found!");
            clearCustomerFields();
        }

        totalAmount = order.total;
        $("#total").text(totalAmount.toFixed(2));
        $("#subtotal").text(order.subtotal.toFixed(2));
        $("#discount").val(order.discountPercentage);
        $("#cash").val(order.cash);
        $("#balance").val(order.balance.toFixed(2));
    }

    function clearOrderTable() {
        $("#orderTableBody").empty();
        totalAmount = 0;
        updateTotalDisplay();
    }

   
});