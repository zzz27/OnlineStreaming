import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@mui/material/IconButton';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import MicOffOutlinedIcon from '@mui/icons-material/MicOffOutlined';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import DesktopAccessDisabledIcon from '@mui/icons-material/DesktopAccessDisabled';
import ScreenShareOutlinedIcon from '@mui/icons-material/ScreenShareOutlined';
import StopScreenShareOutlinedIcon from '@mui/icons-material/StopScreenShareOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffOutlinedIcon from '@mui/icons-material/VideocamOffOutlined';
import VolumeUpOutlinedIcon from '@mui/icons-material/VolumeUpOutlined';
import VolumeOffOutlinedIcon from '@mui/icons-material/VolumeOffOutlined';

export interface Pamameters {
    condition: boolean;
    onClick: (name: any) => (evt: any) => void;
    disabled?: boolean;
}

export function PlayPauseIcon(props?:Pamameters){
    return (
        <Tooltip title={  props?.condition ? 'pause' : 'start' }>
            <IconButton onClick={props?.onClick('play')} >
                {props?.condition
                    ? <PauseCircleOutlineIcon sx={{ fontSize: 58 }} color="primary" />
                    : <PlayCircleOutlineIcon sx={{ fontSize: 58 }} color="primary" />
                }
            </IconButton>
        </Tooltip>
    );
}

export function CameraIcon(params?:Pamameters){
    return(
        <Tooltip title={ params?.condition ? 'turn off the camera' : 'turn on the camera' }>
            <IconButton onClick={params?.onClick('camera')} disabled={params?.disabled} >
                {params?.condition
                    ? <VideocamOutlinedIcon sx={{ fontSize: 58 }} color="primary" />
                    : <VideocamOffOutlinedIcon sx={{ fontSize: 58 }} color="primary" />
                }
            </IconButton>
        </Tooltip>
    );
}

export function ScreenShareIcon(params?:Pamameters){
    return(
        <Tooltip title={ params?.condition ? 'stop screen share' : 'start screen share' }>
            <IconButton onClick={params?.onClick('screen')} disabled={params?.disabled} >
                {params?.condition
                    ? <ScreenShareOutlinedIcon sx={{ fontSize: 58 }} color="primary" />
                    : <StopScreenShareOutlinedIcon sx={{ fontSize: 58 }} color="primary" />
                }
            </IconButton>
        </Tooltip>
    );
}

export function MyMicIcon(params?:Pamameters){
    return(
        <Tooltip title={ params?.condition ? 'microphone off' : 'microphone on' }>
            <IconButton onClick={params?.onClick('audio')} disabled={params?.disabled} >
                {params?.condition
                    ? <MicNoneOutlinedIcon sx={{ fontSize: 58 }} color="primary" />
                    : <MicOffOutlinedIcon sx={{ fontSize: 58 }} color="primary" />
                }
            </IconButton>
        </Tooltip>
    );
}

export function VolumeIcon(params?:Pamameters){
    return(
        <Tooltip title={ params?.condition ? 'audio off' : 'audio on' }>
            <IconButton onClick={params?.onClick('volume')} disabled={params?.disabled} >
                {params?.condition
                    ? <VolumeUpOutlinedIcon sx={{ fontSize: 58 }} color="primary" />
                    : <VolumeOffOutlinedIcon sx={{ fontSize: 58 }} color="primary" />
                }
            </IconButton>
        </Tooltip>
    );
}

export function DesktopIcon(params?:Pamameters){
    return(
        <Tooltip title={ params?.condition ? 'Video off' : 'Video on' }>
            <IconButton onClick={params?.onClick('video')} disabled={params?.disabled} >
                {params?.condition
                    ? <DesktopWindowsIcon sx={{ fontSize: 58 }} color="primary" />
                    : <DesktopAccessDisabledIcon sx={{ fontSize: 58 }} color="primary" />
                }
            </IconButton>
        </Tooltip>
    );
}
