// ldaProcessor.js
var request       = require('request')
var fs            = require ('fs')
var path          = require('path')

function getTopics(group_id, callback) {
  jsonpath = path.join(__dirname, '../data/lda.' + group_id + '.json')
  fs.exists(jsonpath, function(exists) { 
    // check if id has already been analysed, if so return cached data
    if (exists) { 
      fetchData(jsonpath, callback)
    } else {
      // otherwise request id to be analysed by LDA
      runLDA(group_id, callback)
    }
  });
}

function runLDA(group_id, callback) {
  console.log('requesting localhost:8080 to run lda')
  request('http://localhost:8080/' + group_id, function(err, res, data) {
    if (err) callback(data, null)
    else if (res.statusCode != 200) callback(data, null)
    else {
      storeData(group_id, data, callback)
    }
  })
}

function storeData(group_id, data, callback) {
  console.log('storing topic data for group ' + group_id)
  fs.writeFile(path.join(__dirname, '../data/lda.' + group_id + '.json'), data, function(err) {
    if (err) callback(err, null)
    else callback(null, JSON.parse(data))
  })
}

function fetchData(group_id, callback) {
  console.log('fetching topic data for group '+ group_id)
  fs.readFile(jsonpath, function(err, data) {
    if (err) callback(err, null)
    else {
      callback(null, JSON.parse(data))

    }
  })
}

module.exports.getTopics = getTopics