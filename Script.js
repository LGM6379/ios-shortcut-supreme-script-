let products = {};

products.keywords = [ "+boxer"];
products.categories = ["Accesories"];
products.sizes = ["small"];
products.colors = [ "white"];


let billing = {};
billing.billing_name = "aidan sherwood ";
billing.email = "";
billing.tel = "";
billing.billing_address = "";
billing.billing_address_2 = "";
billing.billing_zip = "";
billing.billing_city = "";
billing.billing_state = ""
billing.billing_country = "GB";


let payment = {};

payment.n = "";

payment.month = "";

payment.year = "";

payment.cvv = "";

// types of credit card input: visa, master, american_express, jcb, solo, discover, cod

payment.type = "master";


let setup = {};
// AUTO CHECKOUT false/true;
//recommended to leave on false
setup.auto = false;
// CHECKOUT DELAY (ms)
setup.delay = 3000;
setup.timer_switch = false; 
//hours:minutes:seconds 
setup.timer = "23:35:00";


//USER AREA FINISHED. DO NOT CHANGE ANYTHING BELOW!


let urls = {};
let finder = async () => {
    if (setup.timer_switch) {
        let iv = setInterval(() => {
            var currentTime = new Date();
            var currentH = currentTime.getHours().toString().length == 1 ? "0".concat(currentTime.getHours()) : currentTime.getHours()
            var currentM = currentTime.getMinutes().toString().length == 1 ? "0".concat(currentTime.getMinutes()) : currentTime.getMinutes()
            var currentS = currentTime.getSeconds().toString().length == 1 ? "0".concat(currentTime.getSeconds()) : currentTime.getSeconds()
            var current = currentH + ":" + currentM + ":" + currentS;
            bot_status("TIMER SET TO " + setup.timer, "black");
            if (current == setup.timer) {
                clearInterval(iv);
                starter()
            }
        }, 1000)
    } else {
        starter()
    }
}
let starter = async () => {
    bot_status("BEGIN", "purple");
    var res = await fetch("https://www.supremenewyork.com/mobile_stock.json", null);
    if (res.status !== 200) {
        bot_status("NETWORK ERROR", "red");
        await sleep(1000);
        starter()
    } else {
        var response = await res.json();
        bot_status("SEARCHING", "purple");
        var categories = response.products_and_categories;
        for (let index in products.categories) {
            let category = categories[products.categories[index]];
            for (let index2 in category) {
                let product = category[index2];
                if (check_keywords(product.name, products.keywords[index])) {
                    bot_status("CHEFFING " + product.name, "purple");
                    urls[index] = {};
                    let itemInfo = await getData(product.id, index);
                    urls[index].url = itemInfo[0];
                    urls[index].style = itemInfo[1];
                    urls[index].size = itemInfo[2];
                    urls[index].ver = itemInfo[3];
                    urls[index].category = products.categories[index];
                    break
                }
            }
        }
        if (Object.keys(urls).length == products.keywords.length) {
            bot_status("CARTING", "purple");
            open_urls(0)
        } else {
            bot_status("CHEF WORK", "purple");
            await sleep(1000);
            starter()
        }
    }
}
let ismain = async () => {
    if (document.getElementById("categories-list")) return !0;
    await sleep(100);
    return await ismain()
}
let clickcategory = async category => {
    if (!document.getElementById("products") && document.getElementById("categories-list")) {
        document.getElementById(category.toLowerCase() + "-category").click();
        await sleep(50);
        return await clickcategory(category)
    } else {
        return !0
    }
    await sleep(100);
    if (document.getElementById("products") && !document.getElementById("categories-list")) return !0;
    return await clickcategory()
}
let bot_status = (text, color) => {
    let item;
    let parent = document.getElementById("cart-link");
    if (!document.getElementById("script_status")) {
        item = document.createElement("h4");
        item.setAttribute("id", "script_status");
        item.setAttribute("style", `margin-right: 10px;float: right;display: inline-block;margin-top: 0;`);
        parent.parentNode.insertBefore(item, parent.nextSibling)
    } else {
        item = document.getElementById("script_status")
    }
    let message = `<font color="${color}">${text.toUpperCase()}</font>`
    item.innerHTML = message
}
let open_urls = async index => {
	if(urls[index] === undefined){
		await sleep(500);
		checkout_stage();
	}else{
		console.log(index, urls, urls[index])
		if(index == Object.keys(urls).length-1) window.location.href = urls[index].url.replace("/add.json", "/"+urls[index].style).replace("shop", "mobile/#products");
		add_to_cart(index, () => {
			open_urls(index+1);
		});
	}
}
const sleep = milliseconds => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}
let add_to_cart = async (index, callback) => {
	if(index == Object.keys(urls).length-1){
	    if (document.getElementsByClassName("cart-button")[0]) {
	        if (document.getElementById('cart-update').children[0].innerHTML == "remove") return true;
	        for (let option of document.getElementsByTagName("option")) {
	            let sizeName = option.text.toLowerCase();
	            if (sizeName == products.sizes[index].toLowerCase() || sizeName == 'N/A') {
	                document.getElementsByTagName("select")[0].value = option.value;
	                break
	            }
	        }
	        bot_status("GOOD STUFF", "green");
	        await sleep(250);
	        document.getElementsByClassName("cart-button")[0].click();
	        await sleep(250);
	        let iv = setInterval(async () => {
	            if (document.getElementById('cart-update').children[0].innerHTML == "remove" || !window.location.href.includes("/#products/")) {
	                clearInterval(iv);
	                bot_status("IN THE CART", "green");
	                callback();
	            }
	        })
	    } else {
	        await sleep(50);
	        return await add_to_cart(index, callback);
	    }
	}else{
		let obj = new FormData();
		if(urls[index].ver == "USA"){
			obj.append("s", urls[index].size);
			obj.append("st", urls[index].style);
			obj.append("qty", 1);
		}else{
			obj.append("size", urls[index].size);
			obj.append("style", urls[index].style);
			obj.append("qty", 1);
		}
		fetch(urls[index].url, {
			method: "POST",
			body: obj
		}).then(response => {
			if(response.status == 200) {
				bot_status("CARTED", "green");
			}else{
				bot_status("ERROR", "red");
			}
			callback()
		})
	}
}
let getData = async (id, index) => {
    let res = await fetch(`/shop/${id}.json`);
    let values = [];
    let myJson = await res.json();
    for (let item of myJson.styles) {
        let color = item.name;
        let sizes = item.sizes;
        if (color.toLowerCase().includes(products.colors[index].toLowerCase())) {
            values.push(`https://www.supremenewyork.com/shop/${id}/add.json`)
            values.push(item.id)
            for(let size of sizes){
            	if(size.name.toLowerCase() == products.sizes[index].toLowerCase() || size.name == 'N/A'){
            		values.push(size.id)
            	}
            }
            values.push(item.currency == "USD" ? "USA" : "EU")
        }
    }
    return values;
}
let check_keywords = (itemName, keyword) => {
    if (itemName == null) return !1;
    itemName = itemName.replace(/-/, "").toLowerCase();
    if (keyword.indexOf("+") > -1) {
        var positiveStart = keyword.indexOf("+");
        var negativeStart = keyword.indexOf("-");
        if (negativeStart == -1) {
            var positiveKeywords = keyword.split("+");
            positiveKeywords.shift();
            for (var pKeyword in positiveKeywords) {
                if (itemName.indexOf(positiveKeywords[pKeyword]) == -1) {
                    return !1
                }
            }
            return !0
        } else {
            if (positiveStart > negativeStart) {
                var positiveKeywords = keyword.substring(positiveStart, negativeStart).split("+");
                var negativeKeywords = keyword.substring(negativeStart, keyword.length).split("-")
            } else {
                var positiveKeywords = keyword.substring(positiveStart, keyword.length).split("+");
                var negativeKeywords = keyword.substring(negativeStart, positiveStart).split("-")
            }
            positiveKeywords.shift();
            negativeKeywords.shift();
            for (var pKeyword in positiveKeywords) {
                if (itemName.indexOf(positiveKeywords[pKeyword]) == -1) {
                    return !1
                }
            }
            for (var nKeyword in negativeKeywords) {
                if (itemName.indexOf(negativeKeywords[nKeyword]) > -1) {
                    return !1
                }
            }
            return !0
        }
    } else {
        return !1
    }
}
let checkout_stage = async () => {
    if (document.getElementById("submit_button")) {
        bot_status("BILLING INFO", "green");
        await sleep(100);
        fill_billing();
        bot_status("PAYMENT INFO", "green");
        await sleep(100);
        fill_payment();
        let tickIV = setInterval(() => {
            if (document.getElementById("order_terms").checked) {
                clearInterval(tickIV)
            } else {
                document.getElementById("order_terms").click()
            }
        })
        await sleep(100);
        if (setup.auto) {
            await sleep(setup.delay);
            document.getElementById("hidden_cursor_capture").click()
            document.getElementById("submit_button").click();
        }
        bot_status("COOKED", "green");
        await sleep(2000);
        bot_status("", "");
        return
    } else {
        window.location.href = 'https://www.supremenewyork.com/mobile/#checkout';
        await sleep(250);
        checkout_stage()
    }
}
let fill_billing = async () => {
    let x = 0;
    let specials = ["billing_country", "billing_state"];
    let event = new Event('change', {
        bubbles: !0
    });
    for (let value in billing) {
        await sleep(50);
        let finalID = "order_" + value;
        if (document.getElementById(finalID)) {
            document.getElementById(finalID).focus();
            document.getElementById(finalID).value = billing[value];
            if (specials.includes(value)) document.getElementById(finalID).dispatchEvent(event)
        }
        x++
    }
    if (document.getElementById("order_bn")) {
        await sleep(50);
        document.getElementById("order_bn").focus();
        document.getElementById("order_bn").value = billing.billing_name
    }
    if (document.getElementById("obz")) {
        await sleep(50);
        document.getElementById("obz").focus();
        document.getElementById("obz").value = billing.billing_zip
    }
}
let fill_payment = async () => {
    let x = 0;
    let specials = ["type", "month", "year"];
    let event = new Event('change', {
        bubbles: !0
    });
    for (let value in payment) {
        await sleep(50);
        let finalID = "credit_card_" + value;
        if (document.getElementById(finalID)) {
            document.getElementById(finalID).focus();
            document.getElementById(finalID).value = payment[value];
            if (specials.includes(value)) document.getElementById(finalID).dispatchEvent(event)
        }
        x++
    }
    if (document.getElementById("cav")) {
        await sleep(50);
        document.getElementById("cav").focus();
        document.getElementById("cav").value = payment.cvv
    }
    if(document.getElementById("cnid")){
        await sleep(50);
        document.getElementById("cnid").focus();
        document.getElementById("cnid").value = payment.n;
    }
    if(document.querySelector("#vvv-container > input")){
        await sleep(50);
        document.querySelector("#vvv-container > input").focus();
        document.querySelector("#vvv-container > input").value = payment.cvv;
    }
}
finder();
completion()
