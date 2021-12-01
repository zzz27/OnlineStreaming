import {
    ILocalVideoTrack,
    IRemoteVideoTrack,
    ILocalAudioTrack,
    IRemoteAudioTrack
} from 'agora-rtc-sdk-ng';
import React, { useRef, useEffect } from 'react';

export interface ConditionPlayerProps {
    videoTrack: ILocalVideoTrack | IRemoteVideoTrack | undefined;
    audioTrack: ILocalAudioTrack | IRemoteAudioTrack | undefined;
    hasVideo: boolean | undefined;
    play: boolean | undefined;
    videoPlay: boolean | undefined;
    audioPlay: boolean | undefined; 
}

export interface VideoPlayerProps {
    videoTrack: ILocalVideoTrack | IRemoteVideoTrack | undefined;
    audioTrack: ILocalAudioTrack | IRemoteAudioTrack | undefined;
}

export const AudioPlayer = (props : VideoPlayerProps) => {
    useEffect(() => {
        if (props.audioTrack) {
            props.audioTrack?.play();
        }
        return () => {
            props.audioTrack?.stop();
        };
    }, [props.audioTrack]);

    return null
}

const MediaPlayer = (props: VideoPlayerProps) => {
    const container = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!container.current) return;
        props.videoTrack?.play(container.current, {fit:"contain"});
        return () => {
            props.videoTrack?.stop();
        };
    }, [container, props.videoTrack]);

    useEffect(() => {
        if (!container.current) return;
        props.audioTrack?.play();
        return () => {
            props.audioTrack?.stop();
        };
    }, [props.audioTrack]);

    return (
        <div ref={container} className="video-player" id="video-player" style={{ width: '100%', height: '100%' }} />
    );
};

export const MediaPlayerCondition = (props: ConditionPlayerProps) => {
    const container = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!container.current) return;
        if(props.videoPlay){
            props.videoTrack?.play(container.current, {fit:"contain"});
        }
        else{
            props.videoTrack?.stop();
        }
        return () => {
            props.videoTrack?.stop();
        };
    }, [container, props.videoTrack, props.videoPlay]);

    useEffect(() => {
        if (!container.current) return;
        if (props.audioPlay) {
            props.audioTrack?.play();
        }
        else{
            props.audioTrack?.stop();
        }
        return () => {
            props.audioTrack?.stop();
        };
    }, [props.audioTrack, props.audioPlay]);

    return (
        <div ref={container} className="video-player" id="video-player" style={{ width: '100%', height: '100%' }} />
    );
};

export const ConditionPlayer = (props: ConditionPlayerProps) => {
    if(props.play === false)
        return null;
    if(props.hasVideo)
        return MediaPlayerCondition(props);
    else
        return AudioPlayer({videoTrack:props.videoTrack, audioTrack:props.audioTrack});
};

export default MediaPlayer;
