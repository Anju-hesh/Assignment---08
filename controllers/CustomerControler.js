let dashboardUpdater = {
    customerCount: 0,
    updateCustomerCount: function(count) {
        this.customerCount = count;
        $('.customer-box .box-value').text(count);
    }
};

$(document).ready(function () {
    generateCustomerId();

    dashboardUpdater.updateCustomerCount(CustomerModel.getAllCustomers().length);

    $("#saveCustomer").on("click", handleSaveCustomer);
    $("#removeCustomer").on("click", handleRemoveCustomer);
    $("#updateCustomer").on("click", handleUpdateCustomer);
    $("#getAllCustomers").on("click", loadAllCustomers);
    $("#clearCustomerForm").on("click", clearCustomerForm);
    $("#table_body").on("click", "tr", handleCustomerSelection);

    loadAllCustomers();
});

function generateCustomerId() {
    const nextId = CustomerModel.generateCustomerId();
    $("#customerId").val(nextId);
}

function handleSaveCustomer() {
    if (!validateCustomerForm()) return;

    let customer = {
        id: $("#customerId").val(),
        name: $("#customerName").val(),
        address: $("#customerAddress").val(),
        salary: parseFloat($("#customerSalary").val())
    };

    if (CustomerModel.saveCustomer(customer)) {
        loadAllCustomers();
        clearCustomerForm();
        generateCustomerId();

        dashboardUpdater.updateCustomerCount(CustomerModel.getAllCustomers().length);
        
        alert("Customer saved successfully!");
    } else {
        alert("Customer ID already exists. Please use a unique ID.");
    }
}

function loadAllCustomers() {
    const customerTable = $("#table_body");
    customerTable.empty();

    const customers = CustomerModel.getAllCustomers();
    customers.forEach(customer => {
        customerTable.append(`
            <tr data-id="${customer.id}">
                <td>${customer.id}</td>
                <td>${customer.name}</td>
                <td>${customer.address}</td>
                <td>${customer.salary.toFixed(2)}</td>
            </tr>
        `);
    });

    updateCustomerDropdown();
}

function updateCustomerDropdown() {
    const cmb = $("#select-customer");
    cmb.empty();
    cmb.append($('<option>').val('').text('Select Customer'));

    const customers = CustomerModel.getAllCustomers();
    customers.forEach(customer => {
        cmb.append($('<option>').val(customer.id).text(`${customer.id} - ${customer.name}`));
    });
}

function handleCustomerSelection() {
    const customerId = $(this).data("id");
    const customer = CustomerModel.findCustomer(customerId);

    if (customer) {
        $("#customerId").val(customer.id);
        $("#customerName").val(customer.name);
        $("#customerAddress").val(customer.address);
        $("#customerSalary").val(customer.salary);
    }
}

function handleRemoveCustomer() {
    const customerId = $("#customerId").val();

    if (!confirm(`Are you sure you want to remove customer ${customerId}..?`)) return;

    if (CustomerModel.deleteCustomer(customerId)) {
        loadAllCustomers();
        clearCustomerForm();
        generateCustomerId();

        dashboardUpdater.updateCustomerCount(CustomerModel.getAllCustomers().length);
        
        alert("Customer removed successfully!");
    } else {
        alert("Customer not found!");
    }
}

function handleUpdateCustomer() {
    const customerId = $("#customerId").val();

    if (!validateCustomerForm()) return;

    let customer = {
        id: customerId,
        name: $("#customerName").val(),
        address: $("#customerAddress").val(),
        salary: parseFloat($("#customerSalary").val())
    };

    if (CustomerModel.updateCustomer(customer)) {
        loadAllCustomers();
        clearCustomerForm();
        generateCustomerId();
        alert("Customer updated successfully!");
    } else {
        alert("Customer not found!");
    }
}

function clearCustomerForm() {
    $("#customerId").val("");
    $("#customerName").val("");
    $("#customerAddress").val("");
    $("#customerSalary").val("");
    generateCustomerId();
}

function validateCustomerForm() {
    let customerName = $("#customerName").val();
    let customerAddress = $("#customerAddress").val();
    let customerSalary = $("#customerSalary").val();
    let isValid = true;

    if (!customerName) {
        $("#customerNameError").text("Please enter the Customer Name");
        isValid = false;
    } else {
        $("#customerNameError").text("");
    }

    if (!customerAddress) {
        $("#customerAddressError").text("Please enter the Customer Address");
        isValid = false;
    } else {
        $("#customerAddressError").text("");
    }

    if (!customerSalary) {
        $("#customerSalaryError").text("Please enter the Customer Salary");
        isValid = false;
    } else {
        $("#customerSalaryError").text("");
    }

    return isValid;
}