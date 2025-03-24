function toggleSections() {
        
    const homeSection = document.getElementById("home_section");
    const customerSection = document.getElementById("customer_section");
    const itemSection = document.getElementById("item_section");
    const orderSection = document.getElementById("order_section");

    homeSection.style.display = "none";
    customerSection.style.display = "none";
    itemSection.style.display = "none";
    orderSection.style.display = "none";

    if (!window.location.hash || window.location.hash === "#home_section") {
        homeSection.style.display = "block";
    } else if (window.location.hash === "#customer_section") {
        customerSection.style.display = "block";
    } else if (window.location.hash === "#item_section") {
        itemSection.style.display = "block";
    } else if (window.location.hash === "#order_section") {
        orderSection.style.display = "block";
    }
}

window.addEventListener("load", toggleSections);
window.addEventListener("hashchange", toggleSections);

function handleNavClick(event) {
    event.preventDefault(); 
    const targetHash = event.target.getAttribute("href"); 
    window.location.hash = targetHash; 
}

document.querySelectorAll(".navBar a").forEach(link => {
    link.addEventListener("click", handleNavClick);
});