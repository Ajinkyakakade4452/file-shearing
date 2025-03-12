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
  const [dialog, setDialog] = useState({ isOpen: false, message: "" });
  const fileInputRef = useRef(null);

  const openDialog = (message) => {
    setDialog({ isOpen: true, message });
  };

  const closeDialog = () => {
    setDialog({ isOpen: false, message: "" });
  };

  useEffect(() => {
    const generatePeerId = () => Math.floor(1000 + Math.random() * 9000).toString(); // Generates a 4-digit ID

    const newPeer = new Peer(generatePeerId(), {
      debug: 2,
    });

    newPeer.on("open", (id) => {
      console.log("Generated Peer ID:", id);
      setPeerId(id);
    });

    newPeer.on("connection", (newConn) => {
      if (connections.length >= 2) {
        newConn.close();
        openDialog("Room is full!");
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

  const createConnection = () => {
    openDialog(`Share this ID with the recipient: ${peerId}`);
  };

  const joinConnection = () => {
    if (!connectionId.trim()) {
      openDialog("Enter a valid connection ID.");
      return;
    }
    if (connections.length >= 2) {
      openDialog("Room is full!");
      return;
    }

    try {
      const newConn = peer.connect(connectionId, { reliable: true });

      newConn.on("open", () => {
        openDialog("Connected successfully!");
        setConnections((prev) => [...prev, newConn]);
      });

      newConn.on("data", (data) => {
        if (data && data.file && data.fileName) {
          setReceivedFile(data);
          openDialog(`Received file: ${data.fileName}`);
        } else {
          console.warn("Invalid data received:", data);
        }
      });

      newConn.on("close", () => {
        openDialog("Connection closed by the sender.");
        setConnections((prev) => prev.filter((conn) => conn !== newConn));
      });

      newConn.on("error", (err) => {
        console.error("Connection error:", err);
        openDialog("Failed to connect. Please check the connection ID.");
      });
    } catch (error) {
      console.error("Error joining connection:", error);
      openDialog("An unexpected error occurred while joining the connection.");
    }
  };

  const sendFile = () => {
    if (connections.length === 0) return openDialog("Not connected to any peer.");
    const file = fileInputRef.current.files[0];
    if (!file) return openDialog("Please select a file.");

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      connections.forEach((conn) => conn.send({ file: reader.result, fileName: file.name }));
      openDialog("File sent!");
    };
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-800 via-black to-gray-900 text-white px-4 sm:px-8 md:px-12 py-8">
      <div className="w-full max-w-7xl flex flex-col md:flex-row items-center justify-center md:justify-between gap-12">
        <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            🔗 P2P File Sharing Made Easy
          </h1>
          <p className="text-lg opacity-75">
            Share files instantly & securely with **Peer-to-Peer WebRTC Technology**
            No file size limits, no third-party storage—just seamless transfers.
          </p>
          <div className="space-y-4">
            <FeatureItem text="🔒 End-to-End Encrypted Transfers" />
            <FeatureItem text="⚡ WebRTC-Powered Instant Sharing" />
            <FeatureItem text="🌍 No Cloud Storage, 100% P2P" />
          </div>
        </div>

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

      {dialog.isOpen && <ModalDialog message={dialog.message} onClose={closeDialog} />}
    </div>
  );
};

// ✅ Modal Dialog Component
const ModalDialog = ({ message, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg max-w-sm w-full">
      <p className="text-lg">{message}</p>
      <button
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-400 transition duration-300 w-full"
      >
        OK
      </button>
    </div>
  </div>
);

// ✅ Feature Item Component
const FeatureItem = ({ text }) => (
  <div className="flex items-center space-x-3">
    <CheckCircle className="text-blue-400" size={28} />
    <p className="text-lg font-medium">{text}</p>
  </div>
);

// ✅ Sharing Card Component
const SharingCard = ({ title, description, buttonText, onClick, setConnectionId, fileInputRef, sendFile }) => (
  <div className="bg-white/10 backdrop-blur-lg text-white rounded-3xl shadow-2xl p-6 w-full max-w-xs border border-white/30 hover:scale-105 hover:border-blue-400 transition duration-300">
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="text-sm opacity-75">{description}</p>
    {setConnectionId && <input type="text" placeholder="Enter sender's ID" className="mt-4 p-3 w-full bg-gray-700 rounded-lg" onChange={(e) => setConnectionId(e.target.value)} />}
    {fileInputRef && <input type="file" ref={fileInputRef} className="mt-2 w-full text-sm" />}
    {fileInputRef && <button onClick={sendFile} className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg w-full">Send File</button>}
    <button onClick={onClick} className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg w-full">{buttonText}</button>
  </div>
);

export default App;
