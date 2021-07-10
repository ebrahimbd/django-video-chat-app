from django.conf.urls import url
from django.urls import path, re_path

from . import consumers

websocket_urlpatterns = [
	re_path(r'', consumers.ChatConsumer.as_asgi()),
	# url(r'^ws/chat/(?P<room_name>[^/]+)/$', consumers.ChatConsumer),
	# re_path('ws/chat/<str:room_name>/', consumers.ChatConsumer),
]