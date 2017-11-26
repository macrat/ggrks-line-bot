'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3000;

const config = {
	channelAccessToken: process.env.LINE_ACCESS_TOKEN,
	channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
		console.log(req.body.events);
		Promise
			.all(req.body.events.map(handleEvent))
			.then((result) => res.json(result));
});

const client = new line.Client(config);

function handleEvent(event) {
	var query = '';
	var message = '';
	if (event.type == 'message' && event.message.type == 'text') {
		query = encodeURIComponent(event.message.text);
		message = 'ググってください。';
	} else if (event.type == 'postback' && event.postback.data.startsWith('no;')) {
		query = event.postback.data.slice(3);
		message = [
			'あきらめてググってください。',
			'いいからググってください。',
			'とりあえずググってください。',
		][Math.floor(Math.random()*3)];
	}

	return client.replyMessage(event.replyToken, {
		type: 'template',
		altText: 'ggrks',
		template: {
			type: 'confirm',
			text: message,
			actions: [
				{
					type: 'uri',
					label: 'はい',
					uri: 'https://google.com/search?q=' + query,
				},
				{
					type: 'postback',
					label: 'いやだ',
					//text: 'いやだ',  // これがあるとmessageとpostbackで二回呼ばれてしまうので入れられない。でもボタンを押したフィードバックとしては入れたい。悩ましい。
					data: 'no;' + query,
				},
			],
		},
	});
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);
