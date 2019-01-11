let phoneRe, phoneInput, messageBoard, messageIcon, phoneIcon, transactionStatus, awaitingPin = false;
const payUrl = "http://127.0.0.1:5000/mpesa/trigger"
const payButton = document.getElementById("payBtn");
payButton.addEventListener("click", function () { createPopup(this.dataset.amount) }, false);
function createPopup(amount) {
    const overlay = document.createElement("div");
    overlay.style = "position: fixed;z-index: 999;top:0;left: 0;bottom: 0;right: 0;height:100%;width: 100%;background: #000;opacity:.5;will-change:opacity";
    overlay.innerHTML = "<style>input:focus{outline: none;}#loading {display: inline-block;width: 50px;height: 50px;border: 3px solid rgba(101, 18, 18, .3);border-radius: 50%;border-top-color: #651212;animation: spin 1s ease -in -out infinite;-webkit-animation: spin 1s ease -in -out infinite;}@keyframes spin {to { -webkit-transform: rotate(360deg); }}@-webkit-keyframes spin {to { -webkit-transform: rotate(360deg); }}</style>"
    const widget = document.createElement("div");
    widget.style = "text-align:center;position: relative;transform: perspective(1px) translateY(-50%);-ms-transform: perspective(1px) translateY(-50%);-webkit-transform: perspective(1px) translateY(-50%);-moz-transform: perspective(1px) translateY(-50%);top: 50%;margin-left: auto;margin-right: auto;background-color: #f2f2f4;width: 320px;height: 480px;border-radius: 10px 10px 10px 10px;box-shadow: 0 12px 15px 0 rgba(0, 0, 0, 0.10);overflow: visible;z-index: 1000;margin-top:300px;padding:10px;";
    widget.innerHTML = `<img src = './mpesa.png' alt = 'lipa na mpesa' width = '280'> <form><label for='phone' style='font-size: 14px;color: #000;letter-spacing: 0.5px;text-transform:uppercase;font-weight:bold'>Phone Number</label><img height='10' id='icon' style='padding-left:5px'></img><br><div><input type='text' id='phone' autocomplete='off' placeholder='Enter your phone number' minlength='10' maxlength='13' style='font-size: 14px;color: #283036;border-radius: 1px;height: 45px;padding: 0 20px;border: 2px solid #DEE2E5;border-radius: 4px;margin-bottom: 25px;margin-top: 10px;background-color: #fff;width:60%;text-align:center;' onkeyup='showValidation()'></div><button type='button' onclick="sendPayDetails()" style='font-size: 18px;color: #FFFFFF;letter-spacing: 0.56px;text-align: center;width: 80%;border-radius: 4px;padding: 10px 20px;outline: none;cursor: pointer;background-color:#651212;border:none'>Pay ${amount} KES</button></form><div style='font-size:18px;padding:20px 10px 10px 10px;' id='message'></div><div style='padding:20px 20px 10px 20px;' id='message-icon'></div>`;

    document.body.appendChild(overlay);
    document.body.appendChild(widget);
    phoneRe = /^((\+)?254|0)7(1|2|9|4|0)(\d{7})$/;
    phoneInput = document.getElementById("phone");
    phoneIcon = document.getElementById("icon");
    messageBoard = document.getElementById("message");
    messageIcon = document.getElementById("message-icon");

    const ws = new WebSocket("ws://127.0.0.1:5000/echo");
    ws.onmessage = function (event) {
        console.log(event.data);
        data = JSON.parse(event.data);
        transactionStatus = data["status"];
        switch (transactionStatus) {
            case "SUCCESS":
                messageBoard.innerText = "Transaction Successful!";
                messageIcon.innerHTML = "<img height='50' src='./checked.svg'></img>"
                break;
            case "INSUFFICIENT":
                messageBoard.innerText = "Insufficient Funds!";
                messageIcon.innerHTML = "<img height='50' src='./empty-battery.svg'></img>"
                break;
            case "TIMEOUT":
                messageBoard.innerText = "Operation Timed Out, Please try again!";
                messageIcon.innerHTML = "<img height='50' src='./clockwise-rotation.svg'></img>"
                break;
            case "INPROGRESS":
                messageBoard.innerText = "A similar transaction already in progress. Please wait!";
                messageIcon.innerHTML = "<img height='50' src='./rectangles.svg'></img>"
                break;
            case "CANCELLED":
                messageBoard.innerText = "Transaction cancelled!";
                messageIcon.innerHTML = "<img height='50' src='./unchecked.svg'></img>"
                break;
            default:
                break;
        }
    }
    ws.onopen = function (event) {
        ws.send(JSON.stringify({ status: "Connection Initiated!" }))
    }
}
function validatePhone(no) {
    cleanNumber = no.replace(" ", "");
    if (cleanNumber) {
        if (cleanNumber.match(phoneRe)) {
            return true;
        }
        return false;
    }
}
function showValidation() {
    if (validatePhone(phoneInput.value)) {
        phoneInput.style.borderColor = "#44B13E";
        phoneIcon.src = "./checked.svg";
    } else {
        phoneInput.style.borderColor = "#EF0000";
        phoneIcon.src = "./unchecked.svg";
    }
}
function cleanPhoneData(num) {
    if (num.startsWith("+")) {
        return num.substr(1);
    }
    return "254" + num.substr(1);
}
function sendPayDetails() {
    data = {
        phone: cleanPhoneData(phoneInput.value),
        amount: Math.ceil(payButton.dataset.amount),
        accountRef: "DCG",
        description: "Data Coaching Gym"
    }

    fetch(
        payUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            referrer: "no-referrer",
            body: JSON.stringify(data)
        })
        .then(response => {
            console.log("Request Sent, Awaiting PIN");
            awaitingPin = true;
            messageBoard.innerText = "Request Sent, Please check your phone and confirm the payment";
            messageIcon.innerHTML = "<div id='loading'></div>"
        })
        .catch(error => {
            console.error('Error:', error);
            errorOccured = true;
            messageBoard.innerText = "An Error Occurred, Please Try Again";
        });
}