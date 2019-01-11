from flask import Flask, request, jsonify
import json
from flask_cors import CORS
from dotenv import load_dotenv
from flask_sockets import Sockets
import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime
import os
import math
import base64

load_dotenv()

app = Flask(__name__)
CORS(app)
sockets = Sockets(app)

ws_list = []
BASE_API_URL = "https://api.safaricom.co.ke"


def get_token():
    api_url = BASE_API_URL+"/oauth/v1/generate?grant_type=client_credentials"
    consumer_key = os.environ.get("MPESA_CONSUMER_KEY")
    consumer_secret = os.environ.get("MPESA_CONSUMER_SECRET")

    response = requests.get(api_url, auth=HTTPBasicAuth(
        consumer_key, consumer_secret))
    try:
        access_token = response.json()['access_token']
        return access_token
    except Exception as e:
        return response.text


@app.route("/mpesa/trigger", methods=["POST"])
def trigger_stk():
    data = request.json
    access_token = get_token()
    headers = {"Authorization": "Bearer %s" % access_token}
    api_url = BASE_API_URL+"/mpesa/stkpush/v1/processrequest"
    short_code = os.environ.get("MPESA_SHORTCODE")
    time_stamp = datetime.now().strftime("%Y%m%d%H%M%S")
    passkey = os.environ.get("MPESA_PASSKEY")
    password = base64.b64encode(
        str(short_code+passkey+time_stamp).encode("utf-8")).decode("utf-8")
    stk_request = {
        "BusinessShortCode": short_code,
        "Password": password,
        "Timestamp": time_stamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": data["amount"],
        "PartyA": data["phone"],
        "PartyB": short_code,
        "PhoneNumber": data["phone"],
        "CallBackURL": os.environ.get("MPESA_CALLBACK_URL"),
        "AccountReference": data["accountRef"],
        "TransactionDesc": data["description"]
    }
    response = requests.post(api_url, json=stk_request, headers=headers)
    return response.text


@app.route("/mpesa/c2b", methods=["POST"])
def receive_c2b():
    data = request.json
    body = data['Body']['stkCallback']
    status = ""
    if body["ResultCode"] == 0:
        status = "SUCCESS"
    elif body["ResultCode"] == 1:
        status = "INSUFFICIENT"
    elif "timeout" in body["ResultDesc"]:
        status = "TIMEOUT"
    elif "transaction is already in process" in body["ResultDesc"]:
        status = "INPROGRESS"
    elif "cancelled" in body["ResultDesc"]:
        status = "CANCELLED"
    else:
        pass
    sock = ws_list[-1]
    if not sock.closed:
        sock.send(json.dumps({"status": status}))
    return "Hello"


@sockets.route('/echo')
def echo_socket(ws):
    while not ws.closed:
        ws_list.append(ws)
        message = ws.receive()
        ws.send(message)


if __name__ == "__main__":
    from gevent import pywsgi
    from geventwebsocket.handler import WebSocketHandler
    server = pywsgi.WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    server.serve_forever()
