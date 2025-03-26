let dashboardUpdaterItem = {
    itemCount: 0,
    updateItemCount: function(count) {
        this.itemCount = count;
        $('.item-box .box-value').text(count);
    }
};

$(document).ready(function () {
    generateItemCode();

    dashboardUpdaterItem.updateItemCount(ItemModel.getAllItems().length);

    $("#addItem").on("click", addItem);
    $("#removeItem").on("click", removeItem);
    $("#updateItem").on("click", updateItem);
    $("#getAllItem").on("click", loadAllItem);
    $("#clearItemForm").on("click", clearItemForm);
    $("#item_table_body").on("click", "tr", itemSelection);


    $("#itemCode").on("input", validateItemCodeFormat);
    $("#itemName").on("input", validateItemName);
    $("#itemQty").on("input", validateItemQuantity);
    $("#itemPrice").on("input", validateItemPrice);

    loadAllItem();
});

function generateItemCode() {
    const nextCode = ItemModel.generateItemCode();
    $("#itemCode").val(nextCode);
    validateItemCodeFormat();
}

function addItem() {
    if (!validateItemForm()) return;

    let item = {
        code: $("#itemCode").val(),
        name: $("#itemName").val(),
        qty: parseInt($("#itemQty").val()),
        price: parseFloat($("#itemPrice").val())
    };

    if (ItemModel.saveItem(item)) {
        loadAllItem();
        clearItemForm();
        generateItemCode();

        dashboardUpdaterItem.updateItemCount(ItemModel.getAllItems().length);

        alert("Item saved successfully!");
    } else {
        alert("Item already exists. Please use a unique code.");
    }
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

    updateItemDropdown();
}

function updateItemDropdown() {
    const cmb = $("#select-item");
    cmb.empty();
    cmb.append($('<option>').val('').text('Select Item'));

    const items = ItemModel.getAllItems();
    items.forEach(item => {
        cmb.append($('<option>').val(item.code).text(`${item.code} - ${item.name}`));
    });
}

function itemSelection() {
    const itemCode = $(this).data("id");
    const item = ItemModel.findItem(itemCode);

    if (item) {
        $("#itemCode").val(item.code);
        $("#itemName").val(item.name);
        $("#itemQty").val(item.qty);
        $("#itemPrice").val(item.price);
    }
}

function removeItem() {
    const itemCode = $("#itemCode").val();

    if (!confirm(`Are you sure you want to remove item ${itemCode}?`)) return;

    if (ItemModel.deleteItem(itemCode)) {
        loadAllItem();
        clearItemForm();
        generateItemCode();

        dashboardUpdaterItem.updateItemCount(ItemModel.getAllItems().length);

        alert("Item removed successfully!");
    } else {
        alert("Item not found!");
    }
}

function updateItem() {
    const itemCode = $("#itemCode").val();

    if (!validateItemForm()) return;

    let item = {
        code: itemCode,
        name: $("#itemName").val(),
        qty: parseInt($("#itemQty").val()),
        price: parseFloat($("#itemPrice").val())
    };

    if (ItemModel.updateItem(item)) {
        loadAllItem();
        clearItemForm();
        generateItemCode();
        alert("Item updated successfully!");
    } else {
        alert("Item not found!");
    }
}

function clearItemForm() {
    $("#itemCode").val("");
    $("#itemName").val("");
    $("#itemQty").val("");
    $("#itemPrice").val("");
    generateItemCode();
}

function validateItemForm() {
    let isValid = true;
    
    isValid = validateItemName.call($("#itemName")[0]) && isValid;
    isValid = validateItemQuantity.call($("#itemQty")[0]) && isValid;
    isValid = validateItemPrice.call($("#itemPrice")[0]) && isValid;
    
    return isValid;
}
function validateItemName() {
    const itemName = $(this).val();
    let isValid = true;

    if (!itemName) {
        $(this).removeClass("is-valid").addClass("is-invalid");
        $("#itemNameError").text("Item name is required (3-20 characters)");
        isValid = false;
    } else if (itemName.length < 3 || itemName.length > 20) {
        $(this).removeClass("is-valid").addClass("is-invalid");
        $("#itemNameError").text("Item name must be 3-20 characters long");
        isValid = false;
    } else {
        $(this).removeClass("is-invalid").addClass("is-valid");
        $("#itemNameError").text("");
    }

    return isValid;
}

function validateItemQuantity() {
    const itemQty = $(this).val();
    const isValid = itemQty && !isNaN(itemQty) && itemQty > 0;

    if (isValid) {
        $(this).removeClass("is-invalid").addClass("is-valid");
        $("#itemQtyError").text("");
    } else {
        $(this).removeClass("is-valid").addClass("is-invalid");
        $("#itemQtyError").text("Quantity must be a positive number");
    }

    return isValid;
}

function validateItemPrice() {
    const itemPrice = $(this).val();
    const isValid = itemPrice && !isNaN(itemPrice) && itemPrice > 0;

    if (isValid) {
        $(this).removeClass("is-invalid").addClass("is-valid");
        $("#itemPriceError").text("");
    } else {
        $(this).removeClass("is-valid").addClass("is-invalid");
        $("#itemPriceError").text("Price must be a positive number");
    }

    return isValid;
}

function validateItemCodeFormat(){
    const itemCode = $("#itemCode").val();
    const idRegex = /^I\d{2}-\d{3}$/;
    const isValid = idRegex.test(itemCode);
    
    if (!isValid) {
        $("#itemCode").addClass("is-invalid");
        $("#itemCodeError").text("Item Code must be in format I00-001 (e.g., I00-001)");
    } else {
        $("#itemCode").removeClass("is-invalid");
        $("#itemCodeError").text("");
    }
    
    return isValid;
}