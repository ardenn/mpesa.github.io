let phoneRe, phoneInput, phoneIcon, awaitingPin = false;
const payButton = document.getElementById("payBtn");
payButton.addEventListener("click", function () { createPopup(this.dataset.amount) }, false);
function createPopup(amount) {
    const overlay = document.createElement("div");
    overlay.style = "position: fixed;z-index: 999;top:0;left: 0;bottom: 0;right: 0;height:100%;width: 100%;background: #000;opacity:.5;will-change:opacity";
    overlay.innerHTML = "<style>input:focus{outline: none;}</style>"
    const widget = document.createElement("div");
    widget.style = "text-align:center;position: relative;transform: perspective(1px) translateY(-50%);-ms-transform: perspective(1px) translateY(-50%);-webkit-transform: perspective(1px) translateY(-50%);-moz-transform: perspective(1px) translateY(-50%);top: 50%;margin-left: auto;margin-right: auto;background-color: #f2f2f4;width: 320px;height: 480px;border-radius: 10px 10px 10px 10px;box-shadow: 0 12px 15px 0 rgba(0, 0, 0, 0.10);overflow: visible;z-index: 1000;margin-top:300px;padding:10px;";
    widget.innerHTML = `<img src = './mpesa.png' alt = 'lipa na mpesa' width = '280'> <form><label for='phone' style='font-size: 14px;color: #000;letter-spacing: 0.5px;text-transform:uppercase;font-weight:bold'>Phone Number</label><img height='10' id='icon' style='padding-left:5px'></img><br><div><input type='text' id='phone' autocomplete='off' placeholder='Enter your phone number' minlength='10' maxlength='13' style='font-size: 14px;color: #283036;border-radius: 1px;height: 45px;padding: 0 20px;border: 2px solid #DEE2E5;border-radius: 4px;margin-bottom: 25px;margin-top: 10px;background-color: #fff;width:60%;text-align:center;' onkeyup='showValidation()'></div><button type='submit' style='font-size: 18px;color: #FFFFFF;letter-spacing: 0.56px;text-align: center;width: 80%;border-radius: 4px;padding: 10px 20px;outline: none;cursor: pointer;background-color:#651212;border:none'>Pay ${amount} KES</button></form><div style='font-size:16px;padding:20px 10px 10px 10px;' id='message'>Hhahahah nice job done</div>`;

    document.body.appendChild(overlay);
    document.body.appendChild(widget);
    phoneRe = /^(\+254|0)7(1|2|9|4|0)(\d{7})$/;
    phoneInput = document.getElementById("phone");
    phoneIcon = document.getElementById("icon");

    const ws = new WebSocket("ws://127.0.0.1:5050/mpesaresponse");
    ws.onmessage = function (event) {
        console.log(event.data);
    }
    ws.onopen = function (event) {
        console.log(event);
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
        phoneIcon.src = "./tick.png";
    } else {
        phoneInput.style.borderColor = "#EF0000";
        phoneIcon.src = "./x.png";
    }
}