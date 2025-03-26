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

    $("#customerId").on("input", validateCustomerIdFormat);
    $("#customerName").on("input", function() { validateField($(this), "name"); });
    $("#customerAddress").on("input", function() { validateField($(this), "address"); });
    $("#customerSalary").on("input", function() { validateField($(this), "salary"); });

    loadAllCustomers();
});

function generateCustomerId() {
    const nextId = CustomerModel.generateCustomerId();
    $("#customerId").val(nextId);
    validateCustomerIdFormat();
}

function handleSaveCustomer() {
    if (!validateCustomerForm()) return;

    let customer = {
        id: $("#customerId").val(),
        name: $("#customerName").val(),
        address: $("#customerAddress").val(),
        salary: parseFloat($("#customerSalary").val().replace(/,/g, ''))
    };

    if (CustomerModel.saveCustomer(customer)) {
        loadAllCustomers();
        clearCustomerForm();
        generateCustomerId();

        dashboardUpdater.updateCustomerCount(CustomerModel.getAllCustomers().length);
        
        Alert("success", "Customer saved successfully!");
    } else {
        Alert("error", "Customer ID already exists. Please use a unique ID.");
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
        $("#customerId").val(customer.id).removeClass("is-invalid");
        $("#customerName").val(customer.name).removeClass("is-invalid");
        $("#customerAddress").val(customer.address).removeClass("is-invalid");
        $("#customerSalary").val(customer.salary.toFixed(2)).removeClass("is-invalid");
        
        $("#customerIdError").text("");
        $("#customerNameError").text("");
        $("#customerAddressError").text("");
        $("#customerSalaryError").text("");
    }
}

function handleRemoveCustomer() {
    const customerId = $("#customerId").val();

    if (!customerId) {
        Alert("error", "Please select a customer first!");
        return;
    }

    if (!confirm(`Are you sure you want to remove customer ${customerId}..?`)) return;

    if (CustomerModel.deleteCustomer(customerId)) {
        loadAllCustomers();
        clearCustomerForm();
        generateCustomerId();

        dashboardUpdater.updateCustomerCount(CustomerModel.getAllCustomers().length);
        
        Alert("success", "Customer removed successfully!");
    } else {
        Alert("error", "Customer not found!");
    }
}

function handleUpdateCustomer() {
    const customerId = $("#customerId").val();

    if (!customerId) {
        showAlert("error", "Please select a customer first!");
        return;
    }

    if (!validateCustomerForm()) return;

    let customer = {
        id: customerId,
        name: $("#customerName").val(),
        address: $("#customerAddress").val(),
        salary: parseFloat($("#customerSalary").val().replace(/,/g, ''))
    };

    if (CustomerModel.updateCustomer(customer)) {
        loadAllCustomers();
        clearCustomerForm();
        generateCustomerId();
        Alert("success", "Customer updated successfully!");
    } else {
        Alert("error", "Customer not found!");
    }
}

function clearCustomerForm() {
    $("#customerId").val("").removeClass("is-invalid");
    $("#customerName").val("").removeClass("is-invalid");
    $("#customerAddress").val("").removeClass("is-invalid");
    $("#customerSalary").val("").removeClass("is-invalid");
    
    $("#customerIdError").text("");
    $("#customerNameError").text("");
    $("#customerAddressError").text("");
    $("#customerSalaryError").text("");
    
    generateCustomerId();
}

function validateCustomerForm() {
    let isValid = true;
    
    isValid = validateCustomerIdFormat() && isValid;
    isValid = validateField($("#customerName"), "name") && isValid;
    isValid = validateField($("#customerAddress"), "address") && isValid;
    isValid = validateField($("#customerSalary"), "salary") && isValid;
    
    return isValid;
}

function validateCustomerIdFormat() {
    const customerId = $("#customerId").val();
    const idRegex = /^C\d{2}-\d{3}$/;
    const isValid = idRegex.test(customerId);
    
    if (!isValid) {
        $("#customerId").addClass("is-invalid");
        $("#customerIdError").text("Customer ID must be in format C00-001 (e.g., C00-001)");
    } else {
        $("#customerId").removeClass("is-invalid");
        $("#customerIdError").text("");
    }
    
    return isValid;
}

function validateField(field, fieldType) {
    const value = field.val();
    let isValid = true;
    let errorMessage = "";
    
    switch (fieldType) {
        case "name":
            if (!value) {
                errorMessage = "Please enter the Customer Name";
                isValid = false;
            } else if (value.length < 3) {
                errorMessage = "Name must be at least 3 characters";
                isValid = false;
            } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                errorMessage = "Name can only contain letters and spaces";
                isValid = false;
            }
            break;
            
        case "address":
            if (!value) {
                errorMessage = "Please enter the Customer Address";
                isValid = false;
            } else if (value.length < 5) {
                errorMessage = "Address must be at least 5 characters";
                isValid = false;
            }
            break;
            
        case "salary":
            const salaryValue = value.replace(/,/g, '');
            if (!value) {
                errorMessage = "Please enter the Customer Salary";
                isValid = false;
            } else if (isNaN(salaryValue) || parseFloat(salaryValue) <= 0) {
                errorMessage = "Salary must be a positive number";
                isValid = false;
            }
            break;
    }
    
    if (!isValid) {
        field.addClass("is-invalid");
        $(`#customer${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}Error`).text(errorMessage); // Error eka customis kirimak kara 
    } else {
        field.removeClass("is-invalid");
        $(`#customer${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}Error`).text("");
    }
    
    return isValid;
}
