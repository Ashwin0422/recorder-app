# MERN Screen Recorder

A full-stack MERN (React + Node.js + Express + SQLite) application for recording your screen with audio, uploading to a server, and managing recordings.

## ✨ Features

- **Screen Recording**: Capture your screen with audio using `navigator.mediaDevices.getDisplayMedia`
- **Timer**: 3-minute maximum recording limit with countdown display
- **Video Preview**: Preview recorded videos before uploading
- **Download**: Download recordings locally as .webm files
- **Upload**: Upload recordings to the backend server
- **Video Management**: View and play all uploaded recordings
- **Responsive UI**: Clean, modern interface built with Tailwind CSS

## 🏗️ Tech Stack

### Frontend
- React 18 with functional components and hooks
- Tailwind CSS for styling
- Axios for API communication
- MediaRecorder API for video recording

### Backend
- Node.js with Express
- SQLite database with sqlite3
- Multer for file upload handling
- CORS enabled for cross-origin requests

### Database
- SQLite with recordings table
- Stores metadata: id, filename, filepath, filesize, createdAt

## 📁 Project Structure

```
mern-screen-recorder/
│
├── frontend/                 # React application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx          # Main application component
│   │   ├── index.js         # React entry point
│   │   └── index.css        # Tailwind CSS imports
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── backend/                  # Node.js server
│   ├── server.js            # Express server + API routes
│   ├── package.json
│   └── uploads/             # Video storage directory
│
├── package.json             # Root package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd screen-recorder-app
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start both servers:
- Backend: http://localhost:5000
- Frontend: http://localhost:3000


## 🔧 API Endpoints

### Backend API (http://localhost:5000)

- `POST /api/recordings` - Upload a video recording
- `GET /api/recordings` - Get all recordings
- `GET /api/recordings/:id` - Stream a specific recording file

## 📱 Usage

1. **Start Recording**: Click "Start Recording" to begin capturing your screen
2. **Select Screen**: Choose which screen/window to record
3. **Monitor Timer**: Watch the countdown (max 3 minutes)
4. **Stop Recording**: Click "Stop Recording" when done
5. **Preview**: Review your recording in the preview section
6. **Download**: Save the recording locally
7. **Upload**: Send the recording to the server
8. **Manage**: View and play all uploaded recordings

## 🎯 Key Features Explained

### Screen Recording
- Uses `navigator.mediaDevices.getDisplayMedia()` for screen capture
- Records both video and audio
- Supports multiple screen selection
- Automatically stops at 3-minute limit

### Video Processing
- Records in WebM format with VP9 codec
- Generates Blob objects for local handling
- Supports video preview and download
- Efficient streaming for uploaded videos

### Database Management
- SQLite database with auto-incrementing IDs
- Stores file metadata and paths
- Automatic table creation on first run
- Timestamp tracking for all recordings

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run server` - Start only the backend server
- `npm run client` - Start only the frontend
- `npm run build` - Build the frontend for production

You can modify these in the respective configuration files.


**Happy Recording! 🎥✨**
