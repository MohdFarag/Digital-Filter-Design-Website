# Imports
from flask import Flask, jsonify, request, json, render_template
import json
from filter import filterData
from flask_cors import CORS, cross_origin

app = Flask(__name__)
CORS(app)
cors = CORS(app , resources={r"/*": {"origins": "*", "allow_headers": "*", "expose_headers": "*"}})

""" Routes of Pages """
# Home Page
@app.route("/")
def application():
  return "Start"

@app.route("/filter", methods=["POST", "GET"])
@cross_origin()
def filter():
  
  if request.method == 'POST':
    output = json.loads(request.data)
    
    loadedData = json.loads(output['loadedData'])
    zerosLists = json.loads(output['zeros'])
    polesLists = json.loads(output['poles'])

    zeros = list()
    poles = list()
    for numList in zerosLists:        
        num = complex(numList[0], numList[1])
        zeros.append(num)
    
    for numList in polesLists:
        num = complex(numList[0], numList[1])
        poles.append(num)

    filteredData = filterData(loadedData, zeros, poles)
    
    filteredData = [complexNum.real for complexNum in filteredData]
    responseData = {
      'filteredData': filteredData
    }

    return jsonify(responseData)


# Run app
if __name__ == "__main__":  
  # Run
  app.run(debug=True,port=9000)