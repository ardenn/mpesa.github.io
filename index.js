function createPopup() {
    const overlay = document.createElement("div");
    overlay.style = "position: fixed;z-index: 999;top:0;left: 0;bottom: 0;right: 0;height:100%;width: 100%;background: #000;opacity:.5;will-change:opacity";
    const widget = document.createElement("div");
    widget.style = "text-align:center;position: relative;transform: perspective(1px) translateY(-50%);-ms-transform: perspective(1px) translateY(-50%);-webkit-transform: perspective(1px) translateY(-50%);-moz-transform: perspective(1px) translateY(-50%);top: 50%;margin-left: auto;margin-right: auto;background-color: #f2f2f4;width: 320px;height: 480px;border-radius: 10px 10px 10px 10px;box-shadow: 0 12px 15px 0 rgba(0, 0, 0, 0.10);overflow: visible;z-index: 1000;margin-top:300px;padding:10px;";
    widget.innerHTML = "<img src = './mpesa.png' alt = 'lipa na mpesa' width = '280'> <form><label for='phone' style='font-size: 14px;color: #000;letter-spacing: 0.5px;text-transform:uppercase;font-weight:bold'>Phone Number</label><br><input type='text' id='phone' autocomplete='off' placeholder='Enter your phone number' minlength='10' maxlength='13' style='font-size: 14px;color: #283036;border-radius: 1px;height: 45px;padding: 0 20px;border: 1.4px solid #DEE2E5;border-radius: 4px;margin-bottom: 25px;margin-top: 10px;background-color: #fff;width:60%;text-align:center'><button type='submit' style='font-size: 18px;color: #FFFFFF;letter-spacing: 0.56px;text-align: center;width: 72%;border-radius: 4px;padding: 10px 20px;outline: none;cursor: pointer;background-color:#651212;border:none'>Pay</button></form>";

    document.body.appendChild(overlay)
    document.body.appendChild(widget)
}