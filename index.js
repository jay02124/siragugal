/**
 * @format
 */

import { AppRegistry } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import { name as appName } from './app.json';
import trackPlayerService from './src/screens/trackplayer';

// Register your main component
AppRegistry.registerComponent(appName, () => App);

// Register TrackPlayer background service
TrackPlayer.registerPlaybackService(() => trackPlayerService);
