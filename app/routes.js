var express 			= require('express')
var router  			= express.Router()
var path    			= require('path')
var connection = require('./dbConnector')
var processor = require('./messageProcessor')
var lda = require('./ldaProcessor')

router.get('/user', function(req, res) {
	res.sendFile(path.join(__dirname, '../public/user.html'))
 })

router.get('/', function(req, res) {
	res.sendFile(path.join(__dirname, '../public/index.html'))
})

router.post('/api/word-counts', function(req, res) {
	console.log('getting request for wordcounts: '+ req.body)
	processor.uploadData(req.body.names, req.body.ids, req.body.token)
  res.send()
})

router.get('/api/word-counts/:id/:num', function(req, res) {
	connection.getMostUsedWords(req.params.id, req.params.num, function(err, data) {
		if(err) res.status(500).send(err)
		else res.status(200).json(data)
	})
})

router.get('/api/word-counts/:id/:num/common', function(req, res) {
	connection.filterOutCommonCase(req.params.id, req.params.num, function(err, data) {
		if(err) res.status(500).send(err)
		else res.status(200).json(data)
	})
})

router.get('/api/get-group-list', function(req, res) {
	connection.getGroupList(function(err, data) {
		if(err) res.status(500).send(err)
		else res.status(200).json(data)
	})
})

router.get('/api/total-words', function(req, res){
	connection.getTotalWords(function(err, data) {
		if(err) res.status(500).send(err)
		else res.status(200).json(data)
	})
})

router.get('/api/total-groups', function(req, res){
	connection.getTotalGroups(function(err, data) {
		if(err) res.status(500).send(err)
		else res.status(200).json(data)
	})
})
router.get('/api/total-messages', function(req, res){
	connection.getTotalMessages(function(err, data) {
		if(err) res.status(500).send(err)
		else res.status(200).json(data)
	})
})

router.get('/api/lda', function(req, res) {
	console.log('getting data from lda')
	let group_id = req.query.group_id
	lda.getTopics(group_id, function(err, data) {
		if (err) res.status(500).send(err)
		else res.status(200).json(data)
	})
})

module.exports = router
