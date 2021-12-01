import React, { useContext, useEffect, useState } from 'react';
import AgoraRTC, { IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import SettingsIcon from '@mui/icons-material/Settings';
import { useGlobalTrack } from './meeting/meeting';
import {
    Button,
    Modal,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: '10px',
};

export function Settings(props?:any) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [cameraId, setCameraId] = useState<string>('');
    const [cameraList, setCameraList] = useState<MediaDeviceInfo[]>([]);
    const [micId, setMicId] = useState<string>('');
    const [micList, setMicList] = useState<MediaDeviceInfo[]>([]);

    const [videoTrack, audioTrack, setMeetingCameraId] = useGlobalTrack();
    const isCamera = props.isCamera;

    const handleConfirm = () => {
        if(micId !== ''){
            audioTrack?.setDevice(micId);
        }
        if(isCamera && cameraId !== ''){
            videoTrack?.setDevice(cameraId);
        }
        setMeetingCameraId(cameraId);
        setOpen(false);
    }

    useEffect(()=>{
        AgoraRTC.getCameras().then(devices => {
            setCameraList(devices);
        })
        AgoraRTC.getMicrophones().then(devices => {
            setMicList(devices);
        })
    }, [])
    

    return (
        <div>
            <Button onClick={handleOpen}>
                <SettingsIcon sx={{ fontSize: 40 }} />
            </Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography variant="h5" sx={{ m:"10px"}}>
                        Setting
                    </Typography>

                    <FormControl fullWidth sx={{ m:"10px"}}>
                        <InputLabel id="select-label">Camera</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={cameraId}
                            onChange={(evt) => {
                                setCameraId(evt.target.value);
                                console.log({'now cameraId': evt.target.value});
                            }}
                        >
                            {cameraList.map((item, key) => (
                                <MenuItem key={key} value={item.deviceId}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <FormControl fullWidth sx={{ m:"10px"}}>
                        <InputLabel id="select-label">Microphone</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={micId}
                            onChange={(evt) => {
                                setMicId(evt.target.value);
                                console.log({'now micId': evt.target.value});
                            }}
                        >
                            {micList.map((item, key) => (
                                <MenuItem key={key} value={item.deviceId}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button variant='contained' onClick={handleConfirm} sx={{ m:"10px"}} >
                        确定
                    </Button>

                    <Button variant='outlined' onClick={handleClose} sx={{ m:"10px"}} >
                        取消
                    </Button>
                </Box>
            </Modal>
        </div>
    );
}
