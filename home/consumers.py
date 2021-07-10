from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json
from .models import *

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
	
		self.room_group_name = 'Teat-Room'
		# print(self.scope["user"])

		# Join room group
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)

		await self.accept()

	async def disconnect(self, close_code):
		# Leave room group
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)

		

	# Receive message from WebSocket
	async def receive(self, text_data):

		receive_dict=json.loads(text_data)
		message=receive_dict['message']

		action=receive_dict['action']

		if (action == 'new-offer') or (action == 'new-answer'):
			print("jjjjj")
			reciver_channel_name=receive_dict['message']['receive_channel-name']
			receive_dict['message']['receive_channel-name']=self.channel_name
			await self.channel_layer.send(
		            reciver_channel_name,
		            {
		            	'type': 'send.sdp',
		            	'receive_dict': receive_dict
		            }
            )
			return
    


		


		receive_dict['message']['receive_channel-name']=self.channel_name

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'send.message',
				'receive_dict': receive_dict,
			}
        )


 
	async def send_message(self, event):
		receive_dict = event['receive_dict']

		# Send message to WebSocket
		await self.send(text_data=json.dumps(receive_dict)) 

         