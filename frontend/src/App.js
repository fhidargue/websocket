import React, { useState, useEffect, useRef } from 'react';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client';

const App = () => {
  const [bids, setBids] = useState([]);
  const [bid, setBid] = useState('');
  const [profile, setProfile] = useState('');
  const stompClientRef = useRef(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);

    const handleNewMessage = (message) => {
      const receivedMessage = JSON.parse(message.body);
      setBids(prevBids => [...prevBids, receivedMessage]);
    };

    client.connect({}, () => {
      if (!isSubscribedRef.current) {
        client.subscribe('/topic/messages', handleNewMessage);
        isSubscribedRef.current = true;
      }
      stompClientRef.current = client;
    });

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.disconnect();
      }
    };
  }, []);

  const handleProfileChange = (event) => {
    setProfile(event.target.value);
  };

  const handleBidChange = (event) => {
    setBid(event.target.value);
  };

  const sendMessage = () => {
    if (bid.trim() && stompClientRef.current) {
      const chatMessage = {
        profile,
        bid,
      };

      stompClientRef.current.send('/app/chat', {}, JSON.stringify(chatMessage));
      setBid('');
    }
  };

  return (
    <div>
      <div>
        {bids.map((message, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>{message.profile.charAt(0)}</span>
            <p>{message.profile}</p>
            <p>{message.bid}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          placeholder='Enter your username'
          value={profile}
          onChange={handleProfileChange}
          label='Profile'
        />
        <input
          placeholder='Type a bid'
          value={bid}
          onChange={handleBidChange}
          label='Bid'
        />
        <button onClick={sendMessage} disabled={!bid.trim()}>Send</button>
      </div>
    </div>
  );
};

export default App;
