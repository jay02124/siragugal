# Audio Context Implementation Guide

## Overview
This document explains the new audio context system that manages playback across FM streams and podcasts with resume/start-over functionality.

## Files Created/Modified

### 1. **AudioContext.js** (`src/context/AudioContext.js`)
Central context provider managing all audio playback logic.

#### Key Features:
- **TrackPlayer Integration**: Uses react-native-track-player for unified audio management
- **Resume Functionality**: Saves playback position for podcasts using AsyncStorage
- **Track Management**: Handles both FM streams and podcasts
- **Notification Updates**: Automatically updates notifications with current track info
- **Single Audio Source**: Stops other audio when playing new content

#### Key Functions:
```javascript
// Initialize TrackPlayer and set up event listeners
initializeTrackPlayer()

// Play a track (FM or podcast)
playTrack(track, options)

// Pause current playback and save position
pausePlayback()

// Resume from saved position
resumePlayback()

// Stop playback completely
stopPlayback()

// Get last paused podcast info
getLastPausedPodcast()

// Clear saved position for podcast
clearSavedPodcast(podcastId)

// Update track metadata for notifications
updateCurrentTrackMetadata(metadata)
```

#### State Values:
```javascript
{
  currentTrack,           // Currently playing track object
  isPlaying,             // Boolean - is audio playing
  isBuffering,           // Boolean - is audio buffering
  bufferingTrackId,      // ID of track being buffered
  trackList,             // Array of available tracks
  pausedPositions,       // Object storing saved positions
  defaultTrack,          // Default FM track template
}
```

### 2. **Home Screen** (`src/screens/Home/index.js`)
Updated to use AudioContext for FM stream playback.

#### Changes:
- Replaced local TrackPlayer setup with context methods
- Uses `useAudio()` hook to access playback controls
- Dynamic FM track creation with live broadcast title
- Notification updates when broadcast changes
- Play/Pause functionality via context

#### Usage Example:
```javascript
const {
  currentTrack,
  isPlaying,
  bufferingTrackId,
  playTrack,
  pausePlayback,
  resumePlayback,
  updateCurrentTrackMetadata,
  defaultTrack,
} = useAudio();

// Create FM track
const fmTrack = {
  ...defaultTrack,
  url: broadwave,
  title: liveBroadcast?.broadcast_title,
  artist: 'SIRAGUGAL CRS FM 89.6 MHz',
  artwork: require('../../../assets/logo/logo.png'),
};

// Play FM stream
playTrack(fmTrack);
```

### 3. **Podcast Screen** (`src/screens/Podcast/index.js`)
Complete rewrite with resume/start-over functionality.

#### New Features:
- **Resume Functionality**: Automatically saves playback position when pausing
- **Start Over Button**: Reset podcast to beginning with confirmation
- **Smart Detection**: Identifies if podcast has been played before
- **Failure Handling**: Detects resume failures and plays from start with alert
- **Bottom Control Bar**: Shows current/saved podcast with Resume/Restart options
- **Dynamic UI**: Shows different controls based on playback state

#### Playback States:
1. **Loading**: Shows loading indicator
2. **Active Playing**: Show Pause button
3. **Active Paused**: Show Play button
4. **Previously Played**: Show Resume + Start Over buttons
5. **New Podcast**: Show Play button

#### Resume Logic:
```javascript
// When user clicks Resume
handleResume() {
  // Mark resume attempt
  resumeAttemptRef.current = { trackId, timestamp };
  
  // Try to play with saved position
  playTrack(descriptor);
  
  // Wait 3 seconds for success
  // If failed, show alert and play from start
}
```

## How It Works

### FM Stream Playing:
1. User opens Home screen
2. Fetches live broadcast data
3. Creates FM track with current title
4. Calls `playTrack(fmTrack)`
5. Context stops any podcast and plays FM stream
6. Updates notification with current broadcast title

### Podcast Playing:
1. User selects podcast from list
2. Calls `playTrack(podcastDescriptor)`
3. Context stores podcast URL and track info
4. Automatically saves position when paused
5. Position saved to AsyncStorage for persistence

### Resume Process:
1. User navigates back to Podcast screen
2. System shows "Resume" button if podcast was previously played
3. User clicks Resume
4. Context attempts to play from saved position
5. If playback succeeds within 3 seconds: Continue
6. If playback fails: Alert user and play from start

### Stop Other Audio:
When playing new track:
1. Get current queue from TrackPlayer
2. Reset queue (clears all tracks)
3. Add new track
4. Play new track
This ensures FM stops when podcast plays and vice versa

## AsyncStorage Keys

Podcast positions are stored with key: `podcast_position_{podcastId}`
```javascript
{
  position: 120.5,              // Position in seconds
  timestamp: 1234567890000      // When it was saved
}
```

## Event Listeners Setup

### TrackPlayer Events:
- **PlaybackState**: Updates `isPlaying` and `isBuffering`
- **PlaybackError**: Logs errors and stops buffering
- **RemotePlay/Pause/Stop**: Handles notification controls

## Integration with Existing Code

### Using in Components:
```javascript
import { useAudio } from '../../context/AudioContext';

function MyComponent() {
  const { currentTrack, isPlaying, playTrack, pausePlayback } = useAudio();
  
  return (
    <TouchableOpacity onPress={() => {
      if (isPlaying) pausePlayback();
      else playTrack(myTrack);
    }}>
      <Text>{isPlaying ? 'Pause' : 'Play'}</Text>
    </TouchableOpacity>
  );
}
```

### Track Descriptor Format:
```javascript
{
  id: 'unique-id',
  type: 'fm' | 'podcast',
  url: 'streaming-url',
  title: 'Track Title',
  artist: 'Artist Name',
  artwork: require('path/to/image'),
  duration: '00:00' // Optional
}
```

## Libraries Used
- **react-native-track-player**: Audio playback management
- **@react-native-async-storage/async-storage**: Persist podcast positions
- All existing FontAwesome and UI libraries continue to work

## Error Handling

### Buffering Errors:
- Automatically detected and reported
- Buffering flag cleared on error
- User sees error state in UI

### Resume Failures:
- 3-second timeout to detect failed resumes
- Alert notification to user
- Automatic fallback to play from start
- Saved position cleared

### Track Issues:
- Missing URL handled gracefully
- Try-catch blocks for all async operations
- Console errors logged for debugging

## Notes

1. **Single Audio Stream**: Only one audio plays at a time (FM or Podcast)
2. **Persistence**: Podcast positions survive app restarts
3. **Background Playback**: Uses TrackPlayer for background audio
4. **Notifications**: Automatically updated with current track info
5. **Clean Transitions**: Proper queue cleanup when switching tracks

## Testing Recommendations

1. **FM Playback**: 
   - Play FM stream
   - Switch to Podcast
   - Verify FM stops

2. **Podcast Resume**:
   - Play podcast
   - Close app (background)
   - Reopen and check Resume button
   - Click Resume to verify playback continues

3. **Start Over**:
   - Play podcast to middle
   - Pause and close
   - Return to Podcast screen
   - Click "Start Over" and verify it plays from beginning

4. **Resume Failure**:
   - Play podcast
   - Clear AsyncStorage manually
   - Pause and close app
   - Return and try Resume
   - Should show alert and play from start
