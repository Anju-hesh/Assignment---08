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
            return false;
        }
        
        if (orderId && isValid) {
            $(this).addClass("is-valid");
            const existingOrder = orders.find(order => order.id === orderId);
            
            if (existingOrder) {
                $(this).removeClass("is-valid").addClass("is-invalid");
                $("#orderIdError").text("Order ID already exists. Customer selection is prohibited.");
                $("#select-customer").prop("disabled", true);
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
        $("#Oreder_customerID").val("");
        $("#oreder_customerName").val("");
        $("#order_customerSalary").val("");
        $("#order_customerAddress").val("");
    }

    function clearItemFields() {
        $("#order_itemCode").val("");
        $("#order_itemName").val("");
        $("#order_qtyOnHand").val("");
        $("#order_itemPrice").val("");
        $("#orderQuantity").val("");
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
        if (!itemInDB) {
            alert("Item not found in the database!");
            return;
        }

        if (itemQty > itemInDB.qty) {
            $("#orderQuantityError").text(`Insufficient quantity! Only ${itemInDB.qty} items available.`);
            return;
        } else {
            $("#orderQuantityError").text("");
        }

        const existingItemIndex = orderItems.findIndex(item => item.code === itemCode);

        if (existingItemIndex !== -1) {
            const existingItem = orderItems[existingItemIndex];
            const newQty = existingItem.qty + itemQty;

            if (newQty > itemInDB.qty) {
                $("#orderQuantityError").text(`Insufficient quantity! Only ${itemInDB.qty} items available.`);
                return;
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
    }

    function calculateSubtotalAndBalance() {
        const discountPercentage = parseFloat($("#discount").val()) || 0;
        const discountAmount = (totalAmount * discountPercentage) / 100;
        const cash = parseFloat($("#cash").val()) || 0;
        const subtotal = totalAmount - discountAmount;
        const balance = cash - subtotal;

        $("#subtotal").text(subtotal.toFixed(2));
        $("#balance").val(balance.toFixed(2));
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
                alert("Failed to save order. Please try again.");
                return;
            }

            orders.push(order);

            orderItems.forEach(item => {
                const itemInDB = Model.findItem(item.code);
                if (itemInDB) {
                    const updatedItem = {
                        ...itemInDB,
                        qty: itemInDB.qty - item.qty
                    };
                    Model.updateItem(updatedItem);
                }
            });

            dashboardUpdaterOrder.updateOrdersCount(Model.getAllOrders().length);

            alert("Order saved successfully!");
            clearForm();
        } catch (error) {
            console.error("Error saving order:", error);
            alert("An error occurred while saving the order. Please try again.");
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