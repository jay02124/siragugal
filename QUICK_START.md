# Quick Start Guide - Audio Context Usage

## Installation & Setup

### Already Done ✅
1. Created `src/context/AudioContext.js`
2. Updated `src/screens/Home/index.js`
3. Updated `src/screens/Podcast/index.js`
4. Wrapped `App.js` with AudioProvider
5. Entry point `index.js` already has TrackPlayer setup

### To Use:
No additional installation needed! Everything is configured and ready to go.

---

## Basic Usage in Components

### 1. Import the Hook
```javascript
import { useAudio } from '../../context/AudioContext';
```

### 2. Use in Your Component
```javascript
function MyComponent() {
  const { currentTrack, isPlaying, playTrack, pausePlayback } = useAudio();
  
  return (
    // Your JSX here
  );
}
```

---

## Common Patterns

### Pattern 1: Play Audio When Button Pressed
```javascript
import { useAudio } from '../../context/AudioContext';
import { TouchableOpacity, Text } from 'react-native';

function PlayButton() {
  const { playTrack } = useAudio();
  
  const myTrack = {
    id: 'track-1',
    type: 'podcast',
    url: 'https://example.com/episode1.mp3',
    title: 'Episode 1',
    artist: 'My Podcast',
    artwork: require('./image.png'),
  };
  
  return (
    <TouchableOpacity onPress={() => playTrack(myTrack)}>
      <Text>Play Episode</Text>
    </TouchableOpacity>
  );
}
```

### Pattern 2: Toggle Play/Pause
```javascript
function PlayPauseButton() {
  const { isPlaying, currentTrack, playTrack, pausePlayback, resumePlayback } = useAudio();
  
  const handlePress = () => {
    if (!currentTrack) {
      // Start new playback
      playTrack(someTrack);
    } else if (isPlaying) {
      pausePlayback();
    } else {
      resumePlayback();
    }
  };
  
  return (
    <TouchableOpacity onPress={handlePress}>
      <Text>{isPlaying ? 'Pause' : 'Play'}</Text>
    </TouchableOpacity>
  );
}
```

### Pattern 3: Show Current Track Info
```javascript
function NowPlayingInfo() {
  const { currentTrack, isPlaying, isBuffering } = useAudio();
  
  if (!currentTrack) {
    return <Text>Nothing playing</Text>;
  }
  
  return (
    <View>
      <Text>{currentTrack.title}</Text>
      <Text>{currentTrack.artist}</Text>
      {isBuffering && <Text>Loading...</Text>}
      {isPlaying && <Text>Now Playing ▶️</Text>}
    </View>
  );
}
```

### Pattern 4: Resume Previous Podcast
```javascript
function ResumeButton() {
  const { getLastPausedPodcast, playTrack } = useAudio();
  
  const handleResume = () => {
    const lastPaused = getLastPausedPodcast();
    if (lastPaused) {
      playTrack(lastPaused.descriptor);
    }
  };
  
  return (
    <TouchableOpacity onPress={handleResume}>
      <Text>Resume</Text>
    </TouchableOpacity>
  );
}
```

### Pattern 5: Start Over Podcast
```javascript
function StartOverButton({ podcastId }) {
  const { clearSavedPodcast, playTrack } = useAudio();
  
  const handleStartOver = () => {
    clearSavedPodcast(podcastId);
    const track = {
      id: podcastId,
      url: 'https://example.com/podcast.mp3',
      // ... other track info
    };
    playTrack(track, { position: 0 });
  };
  
  return (
    <TouchableOpacity onPress={handleStartOver}>
      <Text>Start Over</Text>
    </TouchableOpacity>
  );
}
```

---

## Hook Reference

### `useAudio()` - Available Methods & Properties

#### State Properties
```javascript
const {
  // Current Track Info
  currentTrack,           // { id, type, url, title, artist, artwork }
  
  // Playback Status
  isPlaying,             // boolean
  isBuffering,           // boolean
  bufferingTrackId,      // string | null
  
  // Track Lists
  trackList,             // Track[]
  pausedPositions,       // { trackId: seconds }
  
  // Defaults
  defaultTrack,          // Default FM track template
} = useAudio();
```

#### Methods
```javascript
const {
  // Playback Control
  playTrack(track, options),              // Play a track
  pausePlayback(),                        // Pause and save position
  resumePlayback(),                       // Resume from pause
  stopPlayback(),                         // Stop completely
  
  // Podcast-Specific
  getLastPausedPodcast(),                 // Get info about last paused podcast
  clearSavedPodcast(podcastId),           // Clear saved position
  
  // Notifications
  updateCurrentTrackMetadata(metadata),   // Update track info
  
  // Data
  setTrackList(tracks),                   // Update available tracks
} = useAudio();
```

---

## Track Object Format

### Minimal Track (Required Fields)
```javascript
{
  id: 'unique-id',              // Must be unique
  type: 'fm',                   // 'fm' or 'podcast'
  url: 'https://stream.url',    // Valid audio URL
}
```

### Full Track (Recommended)
```javascript
{
  id: 'podcast-episode-1',
  type: 'podcast',
  url: 'https://cdn.example.com/episode1.mp3',
  title: 'Episode 1: Getting Started',
  artist: 'My Awesome Podcast',
  artwork: require('../assets/podcast-cover.jpg'),
  duration: '45:30',            // Optional
}
```

### FM Stream Track Example
```javascript
const fmTrack = {
  id: 'fm-stream',
  type: 'fm',
  url: broadwaveUrl,  // From API
  title: 'SIRAGUGAL CRS FM',
  artist: 'Live Stream',
  artwork: require('../assets/logo.png'),
};
```

---

## PlayTrack Options

### Play From Start
```javascript
playTrack(track);  // or
playTrack(track, { position: 0 });
```

### Play From Saved Position
```javascript
// Automatically handled by context!
// If podcast was paused before, it resumes from saved position
playTrack(track);  // Context checks pausedPositions
```

### Force Play From Specific Position
```javascript
playTrack(track, { position: 120.5 });  // Start at 2:00:30
```

---

## Real-World Examples

### Example 1: Podcast List with Resume Feature
```javascript
function PodcastListItem({ podcast, index }) {
  const { currentTrack, playTrack, getLastPausedPodcast, clearSavedPodcast } = useAudio();
  
  const descriptor = {
    id: podcast.id,
    type: 'podcast',
    url: podcast.broadcast_link,
    title: podcast.broadcast_title,
    artist: podcast.broadcast_decp,
    artwork: require('../assets/logo.png'),
  };
  
  const lastPaused = getLastPausedPodcast();
  const hasBeenPlayed = lastPaused?.id === descriptor.id;
  const isActive = currentTrack?.id === descriptor.id;
  
  return (
    <View>
      <Text>{podcast.broadcast_title}</Text>
      
      {hasBeenPlayed && !isActive ? (
        <View>
          <Button 
            title="Resume" 
            onPress={() => playTrack(descriptor)}
          />
          <Button 
            title="Start Over"
            onPress={() => {
              clearSavedPodcast(descriptor.id);
              playTrack(descriptor, { position: 0 });
            }}
          />
        </View>
      ) : (
        <Button 
          title={isActive ? "Playing..." : "Play"} 
          onPress={() => playTrack(descriptor)}
        />
      )}
    </View>
  );
}
```

### Example 2: Now Playing Widget
```javascript
function NowPlayingWidget() {
  const { currentTrack, isPlaying, isBuffering, pausePlayback, resumePlayback } = useAudio();
  
  if (!currentTrack) {
    return <Text>Nothing Playing</Text>;
  }
  
  return (
    <View style={styles.widget}>
      <Image source={currentTrack.artwork} style={styles.artwork} />
      <View>
        <Text style={styles.title}>{currentTrack.title}</Text>
        <Text style={styles.artist}>{currentTrack.artist}</Text>
      </View>
      
      <TouchableOpacity 
        onPress={() => isPlaying ? pausePlayback() : resumePlayback()}
      >
        <Icon name={isPlaying ? "pause" : "play"} size={24} />
      </TouchableOpacity>
      
      {isBuffering && <ActivityIndicator />}
    </View>
  );
}
```

### Example 3: Master Control Screen
```javascript
function MasterAudioControl() {
  const {
    currentTrack,
    isPlaying,
    isBuffering,
    bufferingTrackId,
    playTrack,
    pausePlayback,
    resumePlayback,
    stopPlayback,
  } = useAudio();
  
  return (
    <View style={styles.container}>
      {/* Current Track Display */}
      {currentTrack && (
        <View>
          <Text>Now Playing: {currentTrack.title}</Text>
          <Text>Type: {currentTrack.type}</Text>
          <Text>Status: {isPlaying ? "Playing" : "Paused"}</Text>
          {isBuffering && <Text>Buffering track: {bufferingTrackId}</Text>}
        </View>
      )}
      
      {/* Controls */}
      <View style={styles.controls}>
        <Button title="Play" onPress={() => resumePlayback()} />
        <Button title="Pause" onPress={() => pausePlayback()} />
        <Button title="Stop" onPress={() => stopPlayback()} />
      </View>
    </View>
  );
}
```

---

## Debugging Tips

### Check Current State
```javascript
function DebugAudio() {
  const { currentTrack, isPlaying, pausedPositions } = useAudio();
  
  useEffect(() => {
    console.log('Current Track:', currentTrack);
    console.log('Is Playing:', isPlaying);
    console.log('Paused Positions:', pausedPositions);
  }, [currentTrack, isPlaying, pausedPositions]);
  
  return null;
}
```

### Log State Changes
```javascript
function LogAudioEvents() {
  const { currentTrack, isPlaying } = useAudio();
  
  useEffect(() => {
    console.log('Track changed:', currentTrack?.title);
  }, [currentTrack]);
  
  useEffect(() => {
    console.log('Playback state:', isPlaying ? 'Playing' : 'Paused');
  }, [isPlaying]);
  
  return null;
}
```

---

## Performance Considerations

### Optimizations Already Implemented
1. **useMemo for FM Track**: Prevents unnecessary recreations
2. **useCallback for Methods**: Functions are stable references
3. **Lazy Initialization**: TrackPlayer setup happens once
4. **Efficient Event Listeners**: Only listen to necessary events

### What You Should Do
1. Use useMemo for track descriptors if created in render:
   ```javascript
   const track = useMemo(() => ({
     id, type, url, title, artist, artwork
   }), [id, url, title]);
   ```

2. Move track data outside component if possible:
   ```javascript
   // Don't do this in render
   const track = { id: 'x', url: 'y' };
   
   // Do this instead
   const TRACK = { id: 'x', url: 'y' };
   ```

---

## Troubleshooting

### Audio Won't Play
1. Check URL is valid: `console.log(track.url)`
2. Check internet connectivity
3. Check if another audio is playing: `currentTrack`
4. Verify track object has required fields

### Resume Not Working
1. Check AsyncStorage is available
2. Check podcast ID is unique
3. Verify pausedPositions object: `console.log(pausedPositions)`
4. Check browser console for errors

### Notification Not Updating
1. Call `updateCurrentTrackMetadata()` after changing title
2. Verify artwork URL is valid
3. Check TrackPlayer options are set correctly

---

## Next Steps

1. **Use in Other Screens**: Import and use `useAudio()` in any component
2. **Customize**: Modify styles and UI as needed
3. **Test**: Run through all test cases mentioned in IMPLEMENTATION_SUMMARY.md
4. **Deploy**: Push to repository

Questions? Check the existing Home and Podcast screens for working examples!
