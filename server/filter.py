from scipy import signal
import numpy as np

def filterData(data, zeros, poles):
    filteredData = np.array([])
    if len(data) > 0 :
        a, b = signal.zpk2tf(zeros,poles,1)
        filteredData = signal.lfilter(b,a,data)    
    
    return filteredData

