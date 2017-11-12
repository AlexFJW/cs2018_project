function storeSearch() {
	var address = window.location.href;
	address = address.slice(0, address.length-10);
	address += "display.html?" + document.getElementById("search-box").value;
	window.location.href = address;
}