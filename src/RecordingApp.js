import React, { useState, useRef, useCallback } from 'react';
import './RecordingApp.css';

const TextWidget = ({ onSave }) => {
  const [text, setText] = useState('');

  const handleSave = () => {
    if (text.trim()) {
      onSave('text', text);
      setText('');
    }
  };

  return (
    <div className="widget">
      <h2>Text Input</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your text here"
      />
      <button onClick={handleSave}>Save Text</button>
    </div>
  );
};

const AudioWidget = ({ onSave }) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        audioChunks.current = [];
      };
      mediaRecorder.current.start();
      setRecording(true);
      setError(null);
    } catch (err) {
      setError("Failed to start audio recording. Please check your permissions.");
      console.error("Error starting audio recording:", err);
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop();
      setRecording(false);
    }
  }, [recording]);

  const saveRecording = () => {
    if (audioBlob) {
      onSave('audio', audioBlob);
      setAudioBlob(null);
    }
  };

  return (
    <div className="widget">
      <h2>Audio Recording</h2>
      {error && <p className="error">{error}</p>}
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <button onClick={saveRecording} disabled={!audioBlob}>
        Save Audio
      </button>
    </div>
  );
};

const VideoWidget = ({ onSave }) => {
  const [recording, setRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorder = useRef(null);
  const videoRef = useRef(null);
  const videoChunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      videoRef.current.srcObject = stream;
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.ondataavailable = (event) => {
        videoChunks.current.push(event.data);
      };
      mediaRecorder.current.onstop = () => {
        const videoBlob = new Blob(videoChunks.current, { type: 'video/webm' });
        setVideoBlob(videoBlob);
        videoChunks.current = [];
      };
      mediaRecorder.current.start();
      setRecording(true);
      setError(null);
    } catch (err) {
      setError("Failed to start video recording. Please check your permissions.");
      console.error("Error starting video recording:", err);
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop();
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setRecording(false);
    }
  }, [recording]);

  const saveRecording = () => {
    if (videoBlob) {
      onSave('video', videoBlob);
      setVideoBlob(null);
    }
  };

  return (
    <div className="widget">
      <h2>Video Recording</h2>
      {error && <p className="error">{error}</p>}
      <video ref={videoRef} autoPlay muted className="video-preview" />
      <button onClick={recording ? stopRecording : startRecording}>
        {recording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <button onClick={saveRecording} disabled={!videoBlob}>
        Save Video
      </button>
    </div>
  );
};

const FileManager = ({ files }) => (
  <div className="file-manager">
    <h2>File Manager</h2>
    <ul>
      {files.map((file, index) => (
        <li key={index}>
          {file.type === 'text' && '📄 '}
          {file.type === 'audio' && '🎵 '}
          {file.type === 'video' && '🎥 '}
          {file.name}
          <button onClick={() => downloadFile(file)}>Download</button>
        </li>
      ))}
    </ul>
  </div>
);

const RecordingApp = () => {
  const [files, setFiles] = useState([]);

  const handleSave = (type, content) => {
    const newFile = {
      type,
      name: `${type}_${Date.now()}.${type === 'text' ? 'txt' : type === 'audio' ? 'webm' : 'webm'}`,
      content
    };
    setFiles([...files, newFile]);
  };

  return (
    <div className="recording-app">
      <h1>React Recording App</h1>
      <div className="widgets">
        <TextWidget onSave={handleSave} />
        <AudioWidget onSave={handleSave} />
        <VideoWidget onSave={handleSave} />
      </div>
      <FileManager files={files} />
    </div>
  );
};

const downloadFile = (file) => {
  const blob = file.content instanceof Blob ? file.content : new Blob([file.content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default RecordingApp;