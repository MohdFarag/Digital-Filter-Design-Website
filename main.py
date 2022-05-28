# Imports
from flask import Flask, render_template, request, redirect, url_for
import json

from pandas import array
from filter import filterData


app = Flask(__name__)

""" Routes of Pages """
# Home Page
@app.route("/")
def application():
    return render_template("index.html")

@app.route('/filter', methods=['POST'])
def filter():
    output = request.get_json()
    
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

    return 'filteredData'

# Run app
if __name__ == "__main__":  
  # Run
  app.run(debug=True,port=9000)