if (!process.env.NODE_ENV) { process.env.NODE_ENV = 'test'; }
var config = require('ezconf');

var chai = require('chai');
chai.config.includeStack = true;
var expect = chai.expect;

var DizzydataApiClient = require('../lib/dizzydata-api-client');

describe('DizzyData', function() {

	this.timeout(60000);

	var dizzydata;

	beforeEach(function() {
		dizzydata = new DizzydataApiClient({
			url: config.dizzydata.URL,
			username: config.dizzydata.USERNAME,
			password: config.dizzydata.PASSWORD
		});
	});


	describe('_requestToken', function() {
		it('should return an access token', function(done) {
			dizzydata._requestToken().then(function(token) {
				expect(token).to.be.a('string');
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});
	});

	describe('_authorizedRequest', function() {
		it('should get an access token and complete the request', function(done) {
			dizzydata._authorizedRequest({
				method: 'GET', url: dizzydata.baseUrl + 'v1/clients'
			}).then(function(response) {
				expect(response).to.be.an.array;
			}, function(error) {
				expect(error).to.be.null;
			}).then(done,done);
		});

		it('should reuse access tokens', function(done) {
			// check that there is no token
			expect(dizzydata.token).to.be.null;
			// issue some request
			dizzydata._authorizedRequest({
				method: 'GET', url: dizzydata.baseUrl + 'v1/clients'
			}).then(function(response) {
				// request successful
				return dizzydata.token.then(function(lastToken) {
					// check that the token is a string
					expect(lastToken).to.be.a.string;
					// issue another request
					return dizzydata._authorizedRequest({
						method: 'GET', url: dizzydata.baseUrl + 'v1/clients'
					}).then(function(response) {
						// request successful
						return dizzydata.token.then(function(currentToken) {
							// check that the current token is equal to the last token
							expect(lastToken).to.equal(currentToken);
						});
					});
				});
			}).catch(function(error) {
				expect(error).to.be.null;
			}).then(done,done);
		});

		it('should fail if the username or password is invalid', function(done) {
			dizzydata.username = 'I do not exist';
			dizzydata.password = 'I am not a valid password';
			dizzydata._authorizedRequest({
				method: 'GET', url: dizzydata.baseUrl + 'v1/clients'
			}).then(function() {
				expect(true).to.be.false;
			}, function(error) {
				expect(error).to.be.an.object;
				expect(error.body.StatusCode).to.equal(401);
			}).then(done, done);
		});

		it('should request a new token if the old one became invalid', function(done) {
			var previousToken;
			dizzydata._authorizedRequest({
				method: 'GET', url: dizzydata.baseUrl + 'v1/clients'
			}).then(function() {
				// invalidate token by requesting a new one and not saving it
				return dizzydata._requestToken()
			}).then(function(token) {
				expect(token).to.be.a.string;
				previousToken = token;
				// do another request
				return dizzydata._authorizedRequest({
					method: 'GET', url: dizzydata.baseUrl + 'v1/clients'
				});
			}).then(function() {
				// obtain the new token
				return dizzydata.token;
			}).then(function(token) {
				expect(token).to.be.a.string;
				expect(token).to.not.equal(previousToken);
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});
	});

	describe('clients', function() {
		it('should return all clients', function(done) {
			dizzydata.clients().then(function(response) {
				expect(response).to.be.an.array;
				response.forEach(function(client) {
					expect(client).to.be.an.object;
					expect(client.id).to.be.a.number;
					expect(client.name).to.be.a.string;
				});
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});

		it('should update a client', function(done) {
			dizzydata.updateClient({
				id: 533,
				active: true
			}).then(function(response) {
				expect(response).to.be.an.object;
				expect(response.StatusCode).to.equal(200);
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});
	});

	describe('invoiceCount', function() {
		it('should return the number of invoices processed', function(done) {
			dizzydata.invoiceCount({
				startDate: '20110101',
				endDate: '20140630'
			}).then(function(response) {
				expect(response).to.be.an.array;
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});

		it('should return the number of invoices processed for a single client', function(done) {
			dizzydata.invoiceCount({
				clientId: 20,
				startDate: '20110101',
				endDate: '20140630'
			}).then(function(response) {
				expect(response).to.be.an.array;
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});
	});

	describe('administrationCount', function() {
		it('should return the number of administrations processed', function(done) {
			dizzydata.administrationCount({
				startDate: '20110101',
				endDate: '20140630'
			}).then(function(response) {
				expect(response).to.be.an.array;
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});

		it('should return the number of administrations processed for a single client', function(done) {
			dizzydata.administrationCount({
				clientId: 20,
				startDate: '20110101',
				endDate: '20140630'
			}).then(function(response) {
				expect(response).to.be.an.array;
			}, function(error) {
				expect(error).to.be.null;
			}).then(done, done);
		});
	});
});