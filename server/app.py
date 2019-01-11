from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_sockets import Sockets
import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime
import os
import base64

load_dotenv()

app = Flask(__name__)
sockets = Sockets(app)

ws_list = []
BASE_API_URL = "https://api.safaricom.co.ke"


@app.route("/mpesa/token", methods=["GET"])
def get_token():
    api_url = BASE_API_URL+"/oauth/v1/generate?grant_type=client_credentials"
    consumer_key = os.environ.get("MPESA_CONSUMER_KEY")
    consumer_secret = os.environ.get("MPESA_CONSUMER_SECRET")

    response = requests.get(api_url, auth=HTTPBasicAuth(
        consumer_key, consumer_secret))
    return response.text


@app.route("/mpesa/trigger", methods=["POST"])
def trigger_stk():
    request_data = request.json
    access_token = get_token()
    headers = {"Authorization": "Bearer %s" % access_token}
    api_url = BASE_API_URL+"/stkpush/v1/processrequest"
    short_code = os.environ.get("MPESA_SHORTCODE")
    time_stamp = datetime.now().strftime("%Y%m%d%H%M%S")
    passkey = os.environ.get("MPESA_PASSKEY")
    password = base64.b64encode(
        str(short_code+passkey+time_stamp).encode("utf-8"))
    request = {
        "BusinessShortCode": short_code,
        "Password": password,
        "Timestamp": time_stamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": request_data["amount"],
        "PartyA": request_data["phone"],
        "PartyB": short_code,
        "PhoneNumber": request_data["phone"],
        "CallBackURL": os.environ.get("MPESA_CALLBACK_URL"),
        "AccountReference": request_data["accountRef"],
        "TransactionDesc": request_data["description"]
    }
    response = requests.post(api_url, json=request, headers=headers)
    return response.text


@app.route("/mpesa/c2b", methods=["POST"])
def receive_c2b():
    request_data = request.json
    for sock in ws_list:
        if not sock.closed:
            sock.send(request_data)
    return "Hello"


@sockets.route('/echo')
def echo_socket(ws):
    while not ws.closed:
        ws_list.append(ws)
        message = ws.receive()
        print(message, len(ws_list))
        ws.send(message)


if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler
    server = pywsgi.WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    server.serve_forever()
