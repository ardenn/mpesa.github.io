from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_socketio import SocketIO

load_dotenv()

app = Flask(__name__)
socketio = SocketIO(app)

app.route("/mpesa/c2b", methods=["POST"])


def receive_c2b():
    socketio.emit("message", {'data': request.data},
                  namespace="/mpesaresponse")
    return jsonify("Success"), 200


if __name__ == "__main__":
    from gevent import monkey
    monkey.patch_all()
    socketio.run(app, port=5050)
