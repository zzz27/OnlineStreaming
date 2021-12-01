import { useState, useEffect } from 'react';
import AgoraRTC, {
    IAgoraRTCClient,
    IAgoraRTCRemoteUser,
    MicrophoneAudioTrackInitConfig,
    CameraVideoTrackInitConfig,
    IMicrophoneAudioTrack,
    ICameraVideoTrack,
    ILocalVideoTrack,
    ILocalAudioTrack,
    UID
} from 'agora-rtc-sdk-ng';

export default function useAgora(client: IAgoraRTCClient | undefined): {
    localVideoTrack: ILocalVideoTrack | undefined,
    localAudioTrack: IMicrophoneAudioTrack | undefined,
    join: Function,
    turnOnDevice: Function,
    turnOffDevice: Function,
    leave: Function,

    remoteUsers: IAgoraRTCRemoteUser[],
    uid: UID | null | undefined
} {
    const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | undefined>(undefined);
    const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | undefined>(undefined);

    const [streamSource, setStreamSource] = useState('camera');
    const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

    const [uid, setUID] = useState<UID | null | undefined>();

    async function join(
        appid: string, 
        channel: string, 
        token: string, 
        role: string,
        userID?: UID | null
    ) {
        if (!client) 
            return;

        if(role === 'host'){
            const [_uid, videoTrack, audioTrack] = await Promise.all([
                client.join(appid, channel, token || null, userID || null),
                AgoraRTC.createCameraVideoTrack(), // AgoraRTC.createCameraVideoTrack({ cameraId: selectedCameraId })
                AgoraRTC.createMicrophoneAudioTrack() // AgoraRTC.createMicrophoneAudioTrack({ microphoneId: selectedMicrophoneId })
            ]);
            setUID(_uid);
            setLocalVideoTrack(videoTrack);
            setLocalAudioTrack(audioTrack);
            
            await client.publish([audioTrack, videoTrack]);
        
            setStreamSource('camera');
        }
        else{
            const [_uid, audioTrack] = await Promise.all([
                client.join(appid, channel, token || null, userID || null),
                AgoraRTC.createMicrophoneAudioTrack() // AgoraRTC.createMicrophoneAudioTrack({ microphoneId: selectedMicrophoneId })
            ]);
            setUID(_uid);
            audioTrack.setMuted(true);
            setLocalAudioTrack(audioTrack);
            await client.publish(audioTrack);
            localAudioTrack?.setMuted(true);
        }
    }

    async function turnOnDevice(device:string, cameraId?:string) {
        client?.unpublish(localVideoTrack);
        localVideoTrack?.stop();
        localVideoTrack?.close();
        if(device === 'camera'){
            console.log('turn on the camera');
            const videoTrack = cameraId===''? await AgoraRTC.createCameraVideoTrack(): await AgoraRTC.createCameraVideoTrack({ cameraId: cameraId })
            setLocalVideoTrack(videoTrack);
            client?.publish(videoTrack);
        }
        else{
            console.log('start screen share');
            const videoTrack = await AgoraRTC.createScreenVideoTrack({}, "disable");
            setLocalVideoTrack(videoTrack);
            client?.publish(videoTrack);
        }
        setStreamSource(device);
    }

    async function turnOffDevice() {
        client?.unpublish(localVideoTrack);
        localVideoTrack?.stop();
        localVideoTrack?.close();
    }

    async function leave() {
        if (localAudioTrack) {
            localAudioTrack.stop();
            localAudioTrack.close();
        }
        if (localVideoTrack) {
            localVideoTrack.stop();
            localVideoTrack.close();
        }
        setRemoteUsers([]);
        await client?.leave();
    }

    useEffect(() => {
        if (!client) return;
        setRemoteUsers(client.remoteUsers);

        const handleUserPublished = async (
            user: IAgoraRTCRemoteUser,
            mediaType: 'audio' | 'video'
        ) => {
            await client.subscribe(user, mediaType);
            console.log(remoteUsers);
            setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
        };
        const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
            setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
        };
        const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
            setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
        };
        const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
            setRemoteUsers((remoteUsers) => Array.from(client.remoteUsers));
        };
        client.on('user-published', handleUserPublished);
        client.on('user-unpublished', handleUserUnpublished);
        client.on('user-joined', handleUserJoined);
        client.on('user-left', handleUserLeft);

        return () => {
            client.off('user-published', handleUserPublished);
            client.off('user-unpublished', handleUserUnpublished);
            client.off('user-joined', handleUserJoined);
            client.off('user-left', handleUserLeft);
        };
    }, [client]);

    return {
        localVideoTrack,
        localAudioTrack,
        join,
        turnOnDevice,
        turnOffDevice,
        leave,
        remoteUsers,
        uid,
    };
}