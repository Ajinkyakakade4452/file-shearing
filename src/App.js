import React, { useState, useEffect, useRef } from "react";
import Peer from "peerjs";
import { CheckCircle } from "lucide-react";
import "./styles/tailwind.css";

const App = () => {
  const [peerId, setPeerId] = useState("");
  const [peer, setPeer] = useState(null);
  const [connections, setConnections] = useState([]);
  const [receivedFile, setReceivedFile] = useState(null);
  const [connectionId, setConnectionId] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Initialize PeerJS connection
    const newPeer = new Peer();
    newPeer.on("open", (id) => setPeerId(id));

    newPeer.on("connection", (newConn) => {
      if (connections.length >= 2) {
        newConn.close();
        alert("Room is full!");
        return;
      }
      setConnections((prev) => [...prev, newConn]);

      newConn.on("data", (data) => {
        if (data.file) {
          setReceivedFile(data);
        }
      });
    });

    setPeer(newPeer);
  }, [connections]);

  // Function to create a connection
  const createConnection = () => {
    alert("Share this ID with the recipient: " + peerId);
  };

  // Function to join a connection
  const joinConnection = () => {
    if (!connectionId) return alert("Enter a valid connection ID.");
    if (connections.length >= 2) return alert("Room is full!");

    const newConn = peer.connect(connectionId);
    newConn.on("open", () => setConnections((prev) => [...prev, newConn]));
    newConn.on("data", (data) => {
      if (data.file) {
        setReceivedFile(data);
      }
    });
  };

  // Function to send a file
  const sendFile = () => {
    if (connections.length === 0) return alert("Not connected to any peer.");
    const file = fileInputRef.current.files[0];
    if (!file) return alert("Please select a file.");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      connections.forEach((conn) => conn.send({ file: reader.result, fileName: file.name }));
      alert("File sent!");
    };
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 via-black to-gray-900 text-white px-4 sm:px-8 md:px-12 py-8">
      <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-center md:justify-between gap-12">
        
        {/* Left Section - Branding & Features */}
        <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            🔗 P2P File Sharing Made Easy
          </h1>
          <p className="text-lg opacity-75">
            Share files instantly & securely with **Peer-to-Peer WebRTC Technology**  
            No file size limits, no third-party storage—just seamless transfers.  
          </p>

          {/* Feature List */}
          <div className="space-y-4">
            <FeatureItem text="🔒 End-to-End Encrypted Transfers" />
            <FeatureItem text="⚡ WebRTC-Powered Instant Sharing" />
            <FeatureItem text="🌍 No Cloud Storage, 100% P2P" />
          </div>

          {/* Footer Credits */}
          {/* <p className="mt-6 text-sm opacity-60">
            Built with ❤️ by <button className="text-indigo-400 hover:underline">Sushant Paliwal</button>
          </p> */}
        </div>

        {/* Right Section - File Sharing Cards */}
        <div className="w-full md:w-1/2 flex flex-wrap justify-center gap-6">
          <SharingCard 
            title="📤 Send File" 
            description="Generate a secure link & share files directly."
            buttonText="Create Connection"
            onClick={createConnection}
            peerId={peerId}
            fileInputRef={fileInputRef}
            sendFile={sendFile}
          />

          <SharingCard 
            title="📥 Receive File" 
            description="Enter sender's ID & start downloading."
            buttonText="Join Connection"
            onClick={joinConnection}
            setConnectionId={setConnectionId}
          />
        </div>
        
        {/* Display Received File */}
        {receivedFile && (
          <div className="w-full flex flex-col items-center mt-6">
            <p>You received a file: {receivedFile.fileName}</p>
            <a href={receivedFile.file} download={receivedFile.fileName}>
              <button className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-400 hover:scale-105 transition duration-300">
                Download
              </button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ Feature Item Component
const FeatureItem = ({ text }) => (
  <div className="flex items-center space-x-3">
    <CheckCircle className="text-blue-400" size={28} />
    <p className="text-lg font-medium">{text}</p>
  </div>
);

// ✅ Fully Responsive File Sharing Card Component
const SharingCard = ({ title, description, buttonText, onClick, peerId, setConnectionId, fileInputRef, sendFile }) => (
  <div className="bg-white/10 backdrop-blur-lg text-white rounded-3xl shadow-2xl p-6 w-full max-w-xs sm:max-w-sm md:max-w-md border border-white/30 transform transition duration-300 hover:scale-105 hover:border-blue-400">
    <h3 className="text-lg font-semibold tracking-wide">{title}</h3>
    <p className="text-sm opacity-75">{description}</p>

    {/* Input Field */}
    {setConnectionId ? (
      <input 
        type="text" 
        placeholder="Enter sender's ID" 
        className="w-full mt-4 p-3 border border-white/20 rounded-lg bg-transparent text-white placeholder-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none transition duration-300"
        onChange={(e) => setConnectionId(e.target.value)}
      />
    ) : (
      <p className="text-sm mt-2">Your ID: {peerId}</p>
    )}

    {/* File Input */}
    {fileInputRef && (
      <div className="mt-4">
        <input type="file" ref={fileInputRef} className="text-white" />
        <button 
          onClick={sendFile} 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-400 hover:scale-105 transition duration-300"
        >
          Send File
        </button>
      </div>
    )}

    {/* Buttons */}
    <button 
      onClick={onClick} 
      className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-600 hover:scale-105 transition duration-300"
    >
      {buttonText}
    </button>
  </div>
);

export default App;