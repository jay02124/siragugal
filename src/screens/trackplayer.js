import TrackPlayer, { Event } from 'react-native-track-player';

const trackPlayerService = async () => {
    TrackPlayer.addEventListener(Event.RemotePlay, async () => {
        try {
            await TrackPlayer.play();
        } catch (e) {
            console.log('RemotePlay error:', e);
        }
    });

    TrackPlayer.addEventListener(Event.RemotePause, async () => {
        try {
            await TrackPlayer.pause();
        } catch (e) {
            console.log('RemotePause error:', e);
        }
    });

    TrackPlayer.addEventListener(Event.RemoteStop, async () => {
        try {
            await TrackPlayer.stop();
        } catch (e) {
            console.log('RemoteStop error:', e);
        }
    });
};

export default trackPlayerService;
