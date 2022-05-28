from numpy import sign
from scipy import signal

def filterData(loadedData, zeros, poles):
    filteredData = list()
    b = list()
    a = list()

    freq_response = signal.freqs_zpk(zeros, poles, 1)
    filteredData = signal.convolve(loadedData, freq_response)

    zi = signal.lfilter_zi(b, a)
    filteredData = signal.lfilter(b, a, filteredData, zi=zi)
    

    return filteredData
