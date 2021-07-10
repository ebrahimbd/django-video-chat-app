 

var mapPeers={}

 
var usernameinput=document.querySelector('#username');

var btnjoin=document.querySelector('#btn-join');

var username;

var webSocket;








function webSocketOnMessage(event){

   //deserilize data

   var parsedata = JSON.parse(event.data);
   var peerusername=parsedata['peer'];
   var action=parsedata['action'];

   if(username==peerusername){
   	return;
   }

   var reciver_channel_name=parsedata['message']['reciver_channel_name'];

   if(action=='new-peer'){
   	createofferer(peerusername, reciver_channel_name);
   	return;
   }

   console.log('//////'+ peerusername);

   


   if (action=='new-offer'){
   	var offer = parsedata['message']['sdp'];
   	createAnswerer(offer, peerusername, reciver_channel_name);
   	return;

    }




   if (action=='new-answer'){


   	var answer=parsedata['message']['sdp'];


   	var peer = mapPeers[peersername][0];


   	console.log("----------------");
 

      console.log(peer);
   

   	peer.setRemoteDescription(answer);

   	return;
   }

}
    
    


btnjoin.addEventListener('click', () => {
	username=usernameinput.value;
	//i got the addind udser value

	console.log(username);

	if (username == '') {

		return;

	}



	usernameinput.value='';
	usernameinput.disable=true;
	usernameinput.style.visibility='hidden';
	btnjoin.disable=true;
	btnjoin.style.visibility='hidden';

	var lableUsername=document.querySelector('#level-username');
	lableUsername.innerHTML=username;  


	var loc=window.location;
	var wsStart= 'ws://';

	if( loc.protocol == 'https'){
		wsStart = 'was://';

	}

	var endPoint= wsStart+loc.host+loc.pathname;
	console.log("==============="+endPoint);



	webSocket = new WebSocket(endPoint);

	webSocket.addEventListener('open',(e) =>{
		console.log("connection open");


      sendSignal('new-peer', {});


	});

    
	webSocket.addEventListener('message', webSocketOnMessage);

	webSocket.addEventListener('close',(e) =>{
		console.log("connection close");
	});


    webSocket.addEventListener('error',(e) =>{
		console.log("connection error");
	});


});

   




var localStream=new MediaStream();

const constraints ={
	'video':true,
	'audio':true
};






const localVideo=document.querySelector('#local-video');
const btntoggleaudio=document.querySelector('#btn-toggle-audio');
const btntogglvedio=document.querySelector('#btn-toggle-video');

var userMedia = navigator.mediaDevices.getUserMedia(constraints)
    .then(stream=>{
         localStream=stream;
         localVideo.srcObject=localStream;
         localVideo.muted=true;

         var audioTracks=stream.getAudioTracks();
         var videoTracks=stream.getVideoTracks();

         audioTracks[0].enabled=true;
         videoTracks[0].enabled=true;

         btntoggleaudio.addEventListener('click', () =>{

         	audioTracks[0].enabled = ! audioTracks[0].enabled;


         	if(audioTracks[0].enabled){
         		btntoggleaudio.innerHTML='Audio Mute' ;

         		return;
         	}

         	btntoggleaudio.innerHTML='Audio Unmute';

         });

         btntogglvedio.addEventListener('click', () =>{

         	videoTracks[0].enabled = ! audioTracks[0].enabled;


         	if(videoTracks[0].enabled){
         		btntogglvedio.innerHTML='Video off';

         		return;
         	}

         	btntogglvedio.innerHTML='Video on';

         });

    })

    .catch(error =>{
    	  console.log("this is error line 114======", error);
    });




   function sendSignal(action,message){
   	var jasonStr= JSON.stringify({
			'peer':username,
			'action':action,
			'message':message ,
		});
      webSocket.send(jasonStr);
   }

   

function createofferer(peerusername, reciver_channel_name){

	var peer = new RTCPeerConnection(null);

	addLocalTracks(peer);

	var dc= peer.createDataChannel('channel');
	dc.addEventListener('open', () => {
		console.log('code sublimeline 185 connection open');
	});


   dc.addEventListener('message', dcOnMessage);




   var remotevedio=createVideo(peerusername);

   setOnTrack(peer, remotevedio);


   mapPeers[peerusername]=[peer, dc];


   peer.addEventListener('iceconnectionsstatechange', ()=>{
   	var iccConnectionState=peer.iceCommectionState;
   	if (iceCommectionState==='failed' || iceCommectionState==='disconnected'|| iceCommectionState==='closed'){
   		delete mapPeers[peerusername];
   		if(iceCommectionState!= 'closed'){
   			peer.colose();
   		}

   		removeVideo(remotevedio);
   	}
   });

  

   peer.addEventListener('icecandidate', (event) =>{

   	if(event.candidate){
   		console.log("187 187 187 187 1087 ha ha ");
   		return;
   	}

     sendSignal('new-offer', {
     	'sdp': peer.localDescription,
     	'reciver_channel_name':reciver_channel_name
     })

   });

   // peer.createofferer()
	  //   .than(o => peer.setLocalDescription(o))
	  //   .than(()=>{
	  //  	console.log("local set description sucessfuly 200 line");
	  //   });
}

     
    
function createAnswerer(offer, peerusername,reciver_channel_name ){

var peer = new RTCPeerConnection(null);
	addLocalTracks(peer);


   var remotevedio=createVideo(peerusername);
   setOnTrack(peer, remotevedio);


   peer.addEventListener('datachannel', e =>{

   	peer.dc=e.channel;
       
      peer.dc.addEventListener('open', () => {
		console.log('code sublimeline 185 connection open');
	   });

    peer.dc.addEventListener('message', dcOnMessage);

  
   mapPeers[peerusername]=[peer, peer.dc];  

   });


   peer.addEventListener('iceconnectionsstatechange', ()=>{
   	var iccConnectionState=peer.iceCommectionState;
   	if (iceCommectionState==='failed' || iceCommectionState==='disconnected'|| iceCommectionState==='closed'){
   		delete mapPeers[peerusername];
   		if(iceCommectionState!= 'closed'){
   			peer.colose();
   		}

   		removeVideo(remotevedio);
   	}
   });




   peer.addEventListener('icecandidate', (event) =>{

   	if(event.candidate){
   		console.log("187 187 187 187 1087 ha ha ");
   		return;
   	}

      sendSignal('new-answer', {
     	'sdp': peer.localDescription,
     	'reciver_channel_name':reciver_channel_name
     })

   });




   peer.setRemoteDescription(offer)
	  .than(() =>{

	   	console.log("line 274 ha ha des det sucsifully");
	   	 return peer.createAnswerer();
	   })

	    .than(a =>{
	    	console.log("answear create");
	    	peer.setRemoteDescription(a);
	    })

}




function addLocalTracks(peer){
	localStream.getTracks().forEach(track=>{

		peer.addTrack(track, localStream);

	});

	return;
}









var massagelist=document.querySelector('#message-list');

function dcOnMessage(event){

	var message=event.data;

	var li=document.createElement('li');
	li.appendChild(document.createTextNode(message));
	massagelist.appendChild(li);

}

function createVideo(peerusername){

	var videoContainer=document.querySelector('#ami');
	var remotevedio=document.createElement('video');
	remotevedio.id=peerusername+ '-video';
	remotevedio.autoplay=true;
	remotevedio.playsinline=true;

	var videoappear=document.createElement('div');
	videoContainer.appendChild(videoappear);
	videoappear.appendChild(remotevedio);

	return remotevedio;


}

                 
   

function setOnTrack(peer, remotevedio) {
	var remoteStream = new MediaStream();

	remotevedio.srcObject=remoteStream;
	peer.addEventListener('track', async(event) =>{
		remoteStream.addTrack(event.track, remoteStream);
	});
 
}

   


var massagelist=document.querySelector('#message-list');

function dcOnMessage(event){

	var message=event.data;
	var li=document.createElement('li');
	li.appendChild(li);

}


   

function removeVideo(video){
	var videoappear=video.parentNode;
	videoappear.parentNode.removeChild(videoappear);
}