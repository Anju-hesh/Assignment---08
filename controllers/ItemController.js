$(document).ready(function () {
    generateItemCode();

    $("#addItem").on("click", addItem);
    $("#removeItem").on("click", removeItem);
    $("#updateItem").on("click", updateItem);
    $("#getAllItem").on("click", loadAllItem);
    $("#clearItemForm").on("click", clearItemForm);
    $("#item_table_body").on("click", "tr", itemSelection);

    loadAllItem();
});

function generateItemCode() {
    const nextCode = ItemModel.generateItemCode();
    $("#itemCode").val(nextCode);
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
    let itemName = $("#itemName").val();
    let itemQty = $("#itemQty").val();
    let itemPrice = $("#itemPrice").val();

    let isValid = true;

    if (!itemName) {
        $("#itemNameError").text("Item Name is a required field. Minimum 5, maximum 20 characters. Spaces allowed.");
        isValid = false;
    } else if (itemName.length < 5 || itemName.length > 20) {
        $("#itemNameError").text("Item Name must be between 5 and 20 characters.");
        isValid = false;
    } else {
        $("#itemNameError").text("");
    }

    if (!itemQty || isNaN(itemQty) || itemQty <= 0) {
        $("#itemQtyError").text("Item Quantity is a required field and must be a positive number.");
        isValid = false;
    } else {
        $("#itemQtyError").text("");
    }

    if (!itemPrice || isNaN(itemPrice) || itemPrice <= 0) {
        $("#itemPriceError").text("Item Price is a required field and must be a positive number.");
        isValid = false;
    } else {
        $("#itemPriceError").text("");
    }

    return isValid;
}