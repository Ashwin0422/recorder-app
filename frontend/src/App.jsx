import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'https://recorder-app-2.onrender.com/api';

// Recording Controls Component
const RecordingControls = ({ isRecording, timer, onStart, onStop }) => (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <div className="text-center">
      <div className="text-5xl font-mono text-blue-600 mb-4">
        {formatTime(timer)}
      </div>
      
      {!isRecording ? (
        <button
          onClick={onStart}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold"
        >
          Start Recording
        </button>
      ) : (
        <button
          onClick={onStop}
          className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold"
        >
          Stop Recording
        </button>
      )}

      {timer >= 180 && (
        <p className="text-red-600 mt-2">Maximum time reached!</p>
      )}
    </div>
  </div>
);

// Video Preview Component
const VideoPreview = ({ recordedVideo, onDownload, onUpload, isUploading }) => {
  if (!recordedVideo) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Your Recording</h2>
      <video
        src={recordedVideo}
        controls
        className="w-full rounded-lg mb-4"
        style={{ maxHeight: '300px' }}
      />
      <div className="flex gap-4 justify-center">
        <button
          onClick={onDownload}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Download
        </button>
        <button
          onClick={onUpload}
          disabled={isUploading}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
};

// Recordings List Component
const RecordingsList = ({ recordings }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-xl font-semibold mb-4">Saved Recordings</h2>
    {recordings.length === 0 ? (
      <p className="text-gray-500 text-center py-8">No recordings saved yet.</p>
    ) : (
      <div className="grid gap-4 md:grid-cols-2">
        {recordings.map((recording) => (
          <div key={recording.id} className="border rounded-lg p-4">
            <div className="mb-3">
              <h3 className="font-medium text-gray-800">
                {recording.filename}
              </h3>
              <p className="text-sm text-gray-600">
                {formatFileSize(recording.filesize)} • {formatDate(recording.createdAt)}
              </p>
            </div>
            <video
              src={`${API_URL}/recordings/${recording.id}`}
              controls
              className="w-full rounded-lg"
              style={{ maxHeight: '200px' }}
            />
          </div>
        ))}
      </div>
    )}
  </div>
);

// Helper functions
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

function App() {
  // Simple state management
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [timer, setTimer] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Recording refs
  const mediaRecorder = useRef(null);
  const stream = useRef(null);
  const timerInterval = useRef(null);

  // Load recordings on start
  useEffect(() => {
    loadRecordings();
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRecording && timer < 180) {
      timerInterval.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerInterval.current);
    }

    return () => clearInterval(timerInterval.current);
  }, [isRecording, timer]);

  const startRecording = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      stream.current = screenStream;
      const recorder = new MediaRecorder(screenStream);
      mediaRecorder.current = recorder;
      
      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      
      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        setRecordedVideo(URL.createObjectURL(videoBlob));
      };
      
      recorder.start();
      setIsRecording(true);
      setTimer(0);
      setRecordedVideo(null);
      
    } catch (error) {
      alert('Cannot start recording. Please allow screen access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      stream.current.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const downloadRecording = () => {
    if (!recordedVideo) return;
    
    const link = document.createElement('a');
    link.href = recordedVideo;
    link.download = `recording-${Date.now()}.webm`;
    link.click();
  };

  const uploadRecording = async () => {
    if (!recordedVideo) return;

    try {
      setIsUploading(true);

      const formData = new FormData();
      const blob = await fetch(recordedVideo).then(r => r.blob());
      formData.append('video', blob, `recording-${Date.now()}.webm`);

      await axios.post(`${API_URL}/recordings`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000
      });

      alert('Recording uploaded successfully!');
      loadRecordings();
      setRecordedVideo(null);
      setTimer(0);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const loadRecordings = async () => {
    try {
      const response = await axios.get(`${API_URL}/recordings`);
      setRecordings(response.data);
    } catch (error) {
      console.error('Could not load recordings:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Screen Recorder
        </h1>

        <RecordingControls
          isRecording={isRecording}
          timer={timer}
          onStart={startRecording}
          onStop={stopRecording}
        />

        <VideoPreview
          recordedVideo={recordedVideo}
          onDownload={downloadRecording}
          onUpload={uploadRecording}
          isUploading={isUploading}
        />

        <RecordingsList recordings={recordings} />
      </div>
    </div>
  );
}

export default App;
