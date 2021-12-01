import React, { useEffect, useState, useMemo, useContext } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import AgoraRTC from 'agora-rtc-sdk-ng';
import Tooltip from '@material-ui/core/Tooltip';
import useAgora from '../../hooks/useAgore';
import MediaPlayer, { ConditionPlayer, MediaPlayerCondition } from '../player/MediaPlayer';
import { useHistory,Prompt } from 'react-router-dom';
import './meeting.css';
import { Settings } from '../settings.component';
import { MyMicIcon, PlayPauseIcon, ScreenShareIcon, CameraIcon, DesktopIcon, VolumeIcon } from './icon';
import { getStyles } from './useStyles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { IconButton, TextField, Modal } from '@mui/material';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import cookies from 'react-cookies'
import Button from '@mui/material/Button';
import MicOffIcon from '@mui/icons-material/MicOff';
import MicIcon from '@mui/icons-material/Mic';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SpeakerNotesOutlinedIcon from '@mui/icons-material/SpeakerNotesOutlined';
import SpeakerNotesOffIcon from '@mui/icons-material/SpeakerNotesOff';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DialogTitle from '@mui/material/DialogTitle';
import PanToolOutlinedIcon from '@mui/icons-material/PanToolOutlined';
import { JoinRoom, ThumpUpRoom, SendMessage, CloseSocket, ExitRoom, CheckRoom, UpdataUserList, KictOutUser, ShutUpUser, GetToken, BeHost, BeAudience } from '../../communication/communication'
import LoopIcon from '@mui/icons-material/Loop';
import BulletScreen, { StyledBullet } from 'rc-bullets';


const APP_ID = "2aca04af4d1d44439917b31bd560704e"
const USER_LIST_CODE = "1"
const LIKE_NUMBER_CODE = "2"
const SEND_MESSAGE_CODE = "4"
const EXIT_ROOM_CODE = "5"
const SHUT_UP_CODE = "6"
const BE_HOST_CODE = "7"
const BE_AUDIENCE_CODE = "8"
const client = AgoraRTC.createClient({ codec: 'h264', mode: 'rtc' });
const VideoTrackContext = React.createContext();
const AudioTrackContext = React.createContext();
const SetCameraIdContext = React.createContext();
const SetDialogOpenContext = React.createContext();
    
function MeetingPage() {
    
    const handleChange = (event) => {
        setAge(event.target.value);
      };
    const classes = getStyles()();
    const { localVideoTrack, localAudioTrack, join, turnOnDevice, turnOffDevice, leave, remoteUsers, uid } =
        useAgora(client);

    // 直播间状态
    const handleContent =(event)=> {
        setMessages(event.target.value);
    };

    const [age, setAge] = useState('');
    const [videoPlay, setVideoPlay] = useState(true);
    const [audioPlay, setAudioPlay] = useState(true);
    const [audienceMic, setAudienceMic] = useState(false);
    const [cameraOn, setCameraOn] = useState(true);
    const [screenShare, setScreenShare] = useState(false);
    const [liveStreamingPlay, setLiveStreamingPlay] = useState(true);
    const [cameraId, setCameraId] = useState('');
    const [messageList, setMessagelist]=useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [userList, setUserList] = useState([]);
    const [messages, setMessages] = useState([]);
    const [likeNumber, setlikeNumber] = useState(0);
    const [warningMessage, setWarningMessage] = useState("");
    const [role, setRole] = useState("audience");
    const [joinRole, setJoinRole] = useState("audience");
    const [isHost, setIsHost] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [isApply, setIsApply] = useState(false);
    const [currentUid, setCurrentUid] = useState(0);
    const [currentHost, setCurrentHost] = useState();
    const [streamer, setStreamer] = useState("");

    const history = useHistory();
    const keys = window.location.href.split('/');
    const len = keys.length;

    const { isAdmin, username } = cookies.load('userData');

    const [screen, setScreen] = useState(null);

    useEffect(() => {
        let s = new BulletScreen('.screen',{duration:8});
        setScreen(s);
    }, []);
    
    const handleCloseDialog = () => {
        setOpenDialog(false);
    }

    const handleSendBullet = (bullet) => {
        console.log(bullet)
        screen.push(
            <StyledBullet
                msg={bullet}
                backgroundColor='#fff'
                
                size='large'
            />
        );
    };

    const handleClick_host = (name) => {
        return (evt) => {
            evt.stopPropagation();
            switch (name) {
                case 'play': {
                    if(liveStreamingPlay){
                        turnOffDevice();
                        localAudioTrack.setMuted(true);
                    }
                    else {
                        cameraOn && turnOnDevice('camera', cameraId);
                        screenShare && turnOnDevice('screen');
                        (audioPlay) && localAudioTrack.setMuted(false);
                    }
                    setLiveStreamingPlay(!liveStreamingPlay);
                    break;
                }
                case 'audio': {
                    audioPlay 
                        ? localAudioTrack.setMuted(true) 
                        : localAudioTrack.setMuted(false);
                    setAudioPlay(!audioPlay);
                    let list = userList;
                    let length = list.length
                    for(let i = 0; i < length; i++) {
                        if(list[i].username === username)
                            list[i].isMicrophoneOn = !list[i].isMicrophoneOn
                    }
                    const message = {
                        roomId : keys[len - 1],
                        userList : list
                    }
                    UpdataUserList(message)
                    break;
                }
                case 'camera': {
                    if(cameraOn){
                        turnOffDevice();
                    }
                    else{
                        turnOnDevice('camera', cameraId);
                    }
                    setCameraOn(!cameraOn);
                    if(!cameraOn){
                        setScreenShare(false);
                    }
                    break;
                }
                case 'screen': {
                    if(screenShare){
                        turnOffDevice();
                    }
                    else{
                        turnOnDevice('screen');
                    }
                    setScreenShare(!screenShare);
                    if(!screenShare){
                        setCameraOn(false);
                    }
                    break;
                }
                default:
                    throw new Error(`Unknown click handler, name: ${name}`);
            }
        };
    };

    const handleClick_audience = (name) => {
        return (evt) => {
            evt.stopPropagation();
            switch (name) {
                case 'play' : {
                    setVideoPlay(!liveStreamingPlay);
                    setAudioPlay(!liveStreamingPlay);
                    setLiveStreamingPlay(!liveStreamingPlay);
                    break;
                }
                case 'video' : {
                    setVideoPlay(!videoPlay);
                    break;
                }
                case 'audio' : {
                    let list = userList
                    let length = list.length
                    let isChange = false
                    console.log("234")
                    for(let i = 0; i < length; i++) {
                        if(list[i].username === username) {
                            console.log(list[i].isMicrophoneOn)
                            console.log("45645")
                            if(list[i].isAllowToSpeak || list[i].isMicrophoneOn === true) {
                                list[i].isMicrophoneOn = !audienceMic
                                isChange = true
                            }
                        }
                    }
                    if(isChange === true) {
                        const message = {
                            roomId : keys[len - 1],
                            userList : list
                        }
                        UpdataUserList(message)
                        .then(
                            () => {
                                console.log("update successfully!")
                            }
                        )
                        audienceMic
                            ? localAudioTrack.setMuted(true) 
                            : localAudioTrack.setMuted(false);
                        setAudienceMic(!audienceMic);
                    }
                    else {
                        setWarningMessage("You are not allowed to speak!")
                        setOpenDialog(true)
                    }
                    break;
                }
                case 'volume' : {
                    setAudioPlay(!audioPlay);
                    break;
                }
                default:
                    throw new Error(`Unknown click handler, name: ${name}`);
            }
        };
    };

    const [Init, setInitState] = useState(false);
    const [Join, setJoin] = useState(false);
    if(Join === false) {
        const ws = new WebSocket("ws://127.0.0.1:8000/api/accept_socket");
        ws.onopen = function () {
            ws.send(username + "_meeting");
            setJoin(true)
        };
        ws.onmessage = function (event) {
            const receivedMessage = event.data;
            console.log("收到消息：" + receivedMessage)
            
            const data = JSON.parse(receivedMessage)
            if(data.code === USER_LIST_CODE) {
                let List = []
                const len = data.data.length
                for(let i = 0; i < len; i++) {
                    const user = {
                        username : data.data[i].username,
                        userRole : data.data[i].role,
                        isAllowToSpeak: data.data[i].isAllowToSpeak,
                        isMicrophoneOn: data.data[i].isMicrophoneOn,
                        isApply: data.data[i].isApply,
                        isLive : data.data[i].isLive,
                        isAdmin : data.data[i].isAdmin,
                        userId : i + 1,
                    }
                    if(user.username === username)
                        setIsLive(user.isLive)
                    if(user.username === username) {
                        if(!user.isLive)
                            setAudienceMic(user.isMicrophoneOn)
                        else
                            setAudioPlay(user.isMicrophoneOn)
                    }
                    List.push(user)
                }
                setUserList(List)
            }
            if(data.code === LIKE_NUMBER_CODE) {
                const number = data.data
                console.log(data.data)
                setlikeNumber(number)
            }
            if(data.code === SEND_MESSAGE_CODE) {
                const len = messageList.length + 1
                const mess = {
                    id: len,
                    message: data.content,
                    sender: data.sender,
                    type: data.type
                }
                if(data.type === '(Public)')
                    handleSendBullet(data.content)
                messageList.push(mess)
                scrollToBottom();
                setMessages("1")
                setMessages("")
            }
            if(data.code === EXIT_ROOM_CODE) {
                leave().then(() => {
                    CloseSocket(username + "_meeting")
                    ExitRoom(username, keys[len - 1])
                    .then(
                        (response) => {
                            console.log("exit success!")
                        }
                    )
                    history.push(`/myRoom`);
                })
            }
            if(data.code === SHUT_UP_CODE) {
                let list = userList;
                let length = list.length
                for(let i = 0; i < length; i++) {
                    if(list[i].username === username) {
                        list[i].isAllowToSpeak = false;
                    }
                }
                const message = {
                    roomId : keys[len - 1],
                    userList : list
                }
                UpdataUserList(message)
            }
            if(data.code === BE_HOST_CODE) {
                leave()
                GetToken(keys[len - 1], "host")
                .then(
                (response) => {
                        const token = response.data.data
                        client.setClientRole("host");
                        join(APP_ID, keys[len - 1], token, "host")
                        setIsLive(true)
                    }
                )
                setStreamer(data.streamer)
            }
            if(data.code === BE_AUDIENCE_CODE) {
                leave()
                GetToken(keys[len - 1], "audience")
                .then(
                    (response) => {
                        const token = response.data.data
                        client.setClientRole("audience");
                        join(APP_ID, keys[len - 1], token, "audience")
                        setIsLive(false)
                        // BeHost(data.streamer, keys[len - 1])
                    }
                )
                setStreamer(data.streamer)
            }
        };
        ws.onclose = function () {
            console.log("连接已关闭...");
        };
        CheckRoom(username, keys[len - 1])
        .then(
            (response) => {
                setRole(response.data.data)
                
                if(role === 'host') {
                    setIsHost(true)
                    setIsLive(true)
                }
                else {
                    setIsHost(false)
                    setIsLive(false)
                }
            }
        )
    }

    if(Join === true && Init === false) {
        const roomId = keys[len - 1]
        if(roomId === "") {
            console.log("RoomID should not be empty!")
        }
        else {
            JoinRoom(username, roomId, role)
            .then(
                (response) => {
                    const token = response.data.data
                    join(APP_ID, roomId, token, (role === "host" ? "host" : "audience"))
                }
            )
        }
        setInitState(true)
    }

    useEffect(() => {
        for(let user of remoteUsers){
            if(user.hasVideo === true){
                setCurrentUid(user.uid);
                setCurrentHost(user);
                break;
            }
        }
    }, [remoteUsers]);

    return (  
        <div className="auth-inner2">
            {(!isLive || typeof(localVideoTrack)!=="undefined") ? (
            <div className="screen">
            <div className="background-png">
            {openDialog && (
                <Modal
                    open={openDialog}
                    onClose={handleCloseDialog}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <SetDialogOpenContext.Provider value={setOpenDialog}>
                        <ConfirmDialog message={warningMessage}/>
                    </SetDialogOpenContext.Provider>
                </Modal>
            )}
                <div className="topMenu">
                    <div className="avatar-container">
                        <div className="default-avatar"> </div>
                        <div className="avatar-text">{ likeNumber }</div>
                        <div className="like"
                            onClick={() => {
                                ThumpUpRoom(keys[len - 1])
                                .then(
                                    (response) => {
                                        console.log("Thumb up successfully!")
                                    }
                                )
                            }}
                        />
                    </div>
                    <Tooltip title="quit">
                        <div
                            className="quit"
                            onClick={() => {
                                if(role === "host") {
                                    let list = userList;
                                    let length = list.length
                                    setIsHost(false)
                                    for(let i = 0; i < length; i++)
                                        if(list[i].isLive && list[i].username !== username)
                                            BeAudience(list[i].username, keys[len - 1])
                                }
                                leave().then(() => {
                                    if(role === "guest" && isLive === true) {
                                        setIsLive(false)
                                        let list = userList;
                                        let length = list.length
                                        for(let i = 0; i < length; i++) {
                                            if(streamer === list[i].username)
                                                list[i].isLive = true;
                                            else
                                                list[i].isLive = false;
                                        }
                                        const message = {
                                            roomId : keys[len - 1],
                                            userList : list
                                        }
                                        UpdataUserList(message)
                                        BeHost(streamer, keys[len - 1])
                                    }

                                    CloseSocket(username + "_meeting")
                                    ExitRoom(username, keys[len - 1])
                                    .then(
                                        (response) => {
                                            console.log("exit success!")
                                        }
                                    )
                                    history.push(`/myRoom`);
                                })
                            }}
                        />
                    </Tooltip>
                </div>
                <div className="mediaContainer">
                    {/* 主播自己 */}
                    {isLive && <MediaPlayer videoTrack={localVideoTrack}/> }
                    {/* 主播端远端用户 */}
                    {isLive && (
                        <div className="remote-users-container">
                            {
                            remoteUsers.map((user) => (
                                <div className="remote-user" key={user.uid}>
                                    <ConditionPlayer
                                        videoTrack={user.videoTrack}
                                        audioTrack={user.audioTrack}
                                        hasVideo={user.hasVideo}
                                        play={true}
                                        videoPlay={true}
                                        audioPlay={true}
                                    />
                                </div>
                            ))
                            }
                        </div>
                    )}
                    {/* 观众主屏幕 */}
                    {!isLive &&
                        <div className="Audience-view">
                            <MediaPlayerCondition
                                videoTrack={currentHost?.videoTrack}
                                audioTrack={currentHost?.audioTrack}
                                videoPlay={videoPlay}
                                audioPlay={audioPlay}
                            />
                        </div>
                    }
                    {/*
                    {/* 观众端其他主播 * }
                    {!isLive && (
                        <div className="remote-users-container">
                            {
                            remoteUsers?.map((user) => (
                                <div className="remote-user" key={user.uid}>
                                    <ConditionPlayer
                                        videoTrack={user.videoTrack}
                                        audioTrack={user.audioTrack}
                                        hasVideo={user.hasVideo}
                                        play={user.uid!==currentUid && currentUid!==0}
                                        videoPlay={videoPlay}
                                        audioPlay={audioPlay}
                                    />
                                </div>
                            ))
                            }
                        </div>
                    )}
                    */ }

                </div>    
                <div className={classes.menuContainer}>
                    {isLive ?
                        <div className={classes.menu}>
                            <PlayPauseIcon condition={liveStreamingPlay} onClick={handleClick_host} />
                            <CameraIcon condition={cameraOn} onClick={handleClick_host} disabled={!liveStreamingPlay} />
                            <ScreenShareIcon condition={screenShare} onClick={handleClick_host} disabled={!liveStreamingPlay} />
                            <MyMicIcon condition={audioPlay} onClick={handleClick_host} disabled={!liveStreamingPlay} />
                        </div>
                    :
                        <div className={classes.menu}>
                            <PlayPauseIcon condition={liveStreamingPlay} onClick={handleClick_audience} />
                            <DesktopIcon condition={videoPlay} onClick={handleClick_audience} disabled={!liveStreamingPlay} />
                            <VolumeIcon condition={audioPlay} onClick={handleClick_audience} disabled={!liveStreamingPlay} />
                            {/* 观众开麦按钮，可以通过disabled属性控制观众是否能开麦 */}
                            <MyMicIcon condition={audienceMic} onClick={handleClick_audience} disabled={!liveStreamingPlay} />
                        </div>          
                    }
                </div>
            </div> 
            </div>)
            : (
                <div className="screen">
                <div className="background-loading">
                    <LoopIcon sx={{ fontSize: 200 }} color="primary" />
                    <h1 style={{color:'#1c89f1'}}>Loading</h1>
                </div>
                </div>
            )}
            {isLive && typeof(localVideoTrack)!=="undefined" &&
                <div className="SettingsButton">
                    <VideoTrackContext.Provider value={localVideoTrack} >
                        <AudioTrackContext.Provider value={localAudioTrack} >
                            <SetCameraIdContext.Provider value={setCameraId} >
                                <Settings isCamera={cameraOn}/>
                            </SetCameraIdContext.Provider>
                        </AudioTrackContext.Provider >
                    </VideoTrackContext.Provider >
                </div>
            }
            <div className="users-list">
            <h5 className="users-head"> Users List </h5>
            <List       
                sx={{ 
                    width: '100%', 
                    Width: 360, 
                    bgcolor: 'background.paper', 
                    height: '30%', 
                    overflow: 'auto',
                    borderRadius: 2,
                    boxShadow: 2
                }}
                >
                <Stack 
                    // divider={<Divider orientation="horizon" flexItem />}
                    >
                    {userList.map((value) => (
                        <ListItem key={value.roomId} variant="filled">
                            <ListItemText primary={`${value.username}(${value.userRole})`} />
                            {value.isApply === true && 
                                <Tooltip title="apply for live">
                                    <IconButton
                                        onClick = {
                                            () => {
                                                if(role === "host" && isLive === true) {
                                                    let list = userList;
                                                    let length = list.length
                                                    for(let i = 0; i < length; i++) {
                                                        if(value.username === list[i].username) {
                                                            list[i].isLive = true;
                                                            list[i].isMicrophoneOn = true;
                                                            list[i].isAllowToSpeak = true;
                                                        }
                                                        else if(username === list[i].username) {
                                                            list[i].isLive = false;
                                                            list[i].isMicrophoneOn = false;
                                                        }
                                                    }
                                                    const message = {
                                                        roomId : keys[len - 1],
                                                        userList : list
                                                    }
                                                    UpdataUserList(message).then(
                                                        (responce) => {
                                                            leave()
                                                            GetToken(keys[len - 1], "audience")
                                                            .then(
                                                                (response) => {
                                                                    const token = response.data.data
                                                                    client.setClientRole("audience");
                                                                    join(APP_ID, keys[len - 1], token, "audience")
                                                                    setIsLive(false)
                                                                    BeHost(value.username, keys[len - 1])
                                                                    setAudienceMic(false)
                                                                }
                                                            )
                                                        }
                                                    )
                                                }
                                            }
                                        }>
                                        <PanToolOutlinedIcon/>
                                    </IconButton>
                                </Tooltip>
                            }

                            {value.username === username && 
                                <Tooltip title="me">
                                    <PersonOutlineIcon sx = {{marginLeft:1}}/>
                                </Tooltip>
                            }

                            {value.isAdmin === true && 
                                <Tooltip title="super user">
                                    <PersonIcon sx = {{marginLeft:2}}/>
                                </Tooltip>
                            }

                            {value.isLive === true && (
                                <Tooltip title="live">
                                    <CloudQueueIcon sx = {{marginLeft:2}}/>
                                </Tooltip>
                            )}

                            {value.isAllowToSpeak && 
                                <Tooltip title="allow to speak">
                                    <IconButton
                                        sx = {{marginLeft:1}}
                                        onClick = {
                                            () => {
                                                if(role === "host") {
                                                    if(value.userRole !== "host") {
                                                        let list = userList;
                                                        let length = list.length
                                                        for(let i = 0; i < length; i++) {
                                                            if(list[i].username === value.username)
                                                                list[i].isAllowToSpeak = !list[i].isAllowToSpeak
                                                        }
                                                        const message = {
                                                            roomId : keys[len - 1],
                                                            userList : list
                                                        }
                                                        UpdataUserList(message)
                                                        .then(
                                                            () => {
                                                                console.log("update successfully!")
                                                            }
                                                        )
                                                        ShutUpUser(value.username, keys[len - 1])
                                                    }
                                                    else {
                                                        setWarningMessage("You can't shut yourself up!")
                                                        setOpenDialog(true)
                                                    }
                                                }
                                            }
                                        }
                                    >
                                        <SpeakerNotesOutlinedIcon />
                                    </IconButton>
                                </Tooltip>
                            }

                            {!value.isAllowToSpeak && 
                                <Tooltip title="not allow to speak">
                                    <IconButton
                                        sx = {{marginLeft:1}}
                                        onClick = {
                                            () => {
                                                if(role === "host") {
                                                    let list = userList;
                                                    let length = list.length
                                                    for(let i = 0; i < length; i++) {
                                                        if(list[i].username === value.username)
                                                            list[i].isAllowToSpeak = !list[i].isAllowToSpeak
                                                    }
                                                    const message = {
                                                        roomId : keys[len - 1],
                                                        userList : list
                                                    }
                                                    UpdataUserList(message)
                                                    .then(
                                                        () => {
                                                            console.log("update successfully!")
                                                        }
                                                    )
                                                }
                                            }
                                        }
                                    >
                                        <SpeakerNotesOffIcon />
                                    </IconButton>
                                </Tooltip>
                            }
                            {!value.isMicrophoneOn ? (
                                <Tooltip title="microphone off">
                                    <MicOffIcon
                                        sx = {{marginLeft:1}}
                                    />
                                </Tooltip>) : (
                                <Tooltip title="microphone on">
                                    <MicIcon
                                        sx = {{marginLeft:1}}
                                    />
                                </Tooltip>
                                )
                            }

                            {isHost && (
                                <Tooltip title="out of the room">
                                    <IconButton
                                    sx = {{marginLeft:1}}
                                    onClick = {
                                        () => {
                                            if(username !== value.username) {
                                                const message = {
                                                    roomId : keys[len - 1],
                                                    username : value.username
                                                }
                                                KictOutUser(message)
                                            }
                                            else {
                                                setWarningMessage("You can't kick yourself out of the room!")
                                                setOpenDialog(true)
                                            }
                                        }
                                    }
                                    >
                                    <LogoutIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </ListItem> 
                                ))}
                </Stack>
                                
            </List>
            <h5 className="users-head2"> Chat Room </h5>
            <Box
                sx={{
                display: 'flex',
                flexDirection: 'column',
                p: 1,
                bgcolor: 'background.paper',
                boxShadow: 2,
                overflow: "auto",
                height: '30%',
                Width: 360,
                width:'100%',
                borderRadius: 3,
                }}
                id="gglol"
                >
                
                {messageList.map((value)=> (
                    
                    value.sender===username?
                    <p className="receiver" key={value.id}>
                        <p className="right_triangle"> </p>
                        <p>
                            <Stack direction="column">
                            <span>{value.sender}{value.type} : </span>
                            <p className="textbreak">{value.message}</p></Stack>
                        </p>
                    </p>:
                    <p className="sender" key={value.id}>
                        <p className="left_triangle"> </p>
                        <p>
                            <Stack direction="column">
                            <span>{value.sender}{value.type} : </span>
                            <p className="textbreak">{value.message}</p></Stack></p>
                    </p>
                    
                ))}
            </Box >

            <Box sx={
                {
                    height:'20%',
                    marginTop:3
                }
            }
            >
            <Stack direction="row" >
                <div className="chat-field">
                    <TextField multiline rows={4} 
                               id="outlined-basic" 
                               variant="filled" 
                               value={messages}
                               onChange={handleContent}
                               overflow='auto'
                               sx={{height:"20%"}}
                               />
                </div>
                
                <Stack direction="column">
                    <Box sx={{ minWidth: 120, marginTop: 2.5}}>
                        <FormControl sx={{minWidth: 120}}>
                            <InputLabel id="select-label"
                                    variant="filled"
                                >Send to</InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={age}
                                label="Age"
                                onChange={handleChange}
                                variant="filled"
                                >
                                <MenuItem value="To All">To All</MenuItem>
                                {userList.map((value) => (
                                            <MenuItem key={value.roomId} value={value.username}>
                                                {value.username}
                                            </MenuItem>
                                        ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <Button variant="contained" sx={{
                        marginTop: 3,
                        
                    }}
                        onClick={() => {
                            const content = messages
                            const roomId = keys[len-1]
                            const targetUser = age
                            const sourceUser = username
                            const message = {
                                content: content,
                                roomId: roomId,
                                targetUser: targetUser,
                                sourceUser: sourceUser,
                            }
                            if(targetUser === "") {
                                setWarningMessage("Please select the object to which the message is sent!")
                                setOpenDialog(true)
                            }
                            else if(content === "" || content?.length === 0) {
                                setWarningMessage("Message content cannot be empty!")
                                setOpenDialog(true)
                            }
                            else {
                                SendMessage(message)
                                .then(
                                    (response) => {
                                        console.log("Message? Message!!")
                                    }
                                )
                            }
                        }}
                    >SEND</Button>
                </Stack>    
            </Stack>
            </Box>
            <Stack direction="row" >
            {role === "host" && 
                <Button variant="contained" sx={{
                        marginTop: 3,
                        marginRight: "60%"
                    }}
                    disabled={isLive}
                    onClick = {
                        () => {
                            leave().then(
                                () => {
                                    let list = userList;
                                    let length = list.length
                                    for(let i = 0; i < length; i++) {
                                        if(list[i].isLive === true) {
                                            BeAudience(list[i].username, keys[len - 1])
                                            list[i].isLive = false
                                            list[i].isMicrophoneOn = false
                                        }
                                        if(list[i].username === username) {
                                            list[i].isLive = true
                                            list[i].isMicrophoneOn = true
                                        }
                                    }
                                    const message = {
                                        roomId : keys[len - 1],
                                        userList : list
                                    }
                                    UpdataUserList(message)
                                    BeHost(username, keys[len - 1])
                                }
                            )
                        }
                    }
                >
                    Back to Live
                </Button>
            }

            {role === "guest" && 
                <Button variant="contained" sx={{
                        marginTop: 3,
                        marginRight: "25%"
                    }}
                    disabled={isHost}
                    onClick = {
                        () => {
                            setIsApply(!isApply)
                            let list = userList
                            let length = list.length
                            for(let i = 0; i < length; i++)
                                if(list[i].username === username)
                                    list[i].isApply = !list[i].isApply
                            const message = {
                                roomId : keys[len - 1],
                                userList : list
                            }
                            UpdataUserList(message)
                        }
                    }
                >
                    {isApply === false ? "Apply for live" : "Withdram apply" }
                </Button>
            }

            {role === "guest" && isLive &&
                <Button variant="contained" sx={{
                        marginTop: 3
                    }}
                    onClick = {
                        () => {
                            let list = userList
                            let length = list.length
                            for(let i = 0; i < length; i++)
                                if(list[i].username === username) {
                                    list[i].isLive = false
                                    list[i].isMicrophoneOn = false
                                }
                            const message = {
                                roomId : keys[len - 1],
                                userList : list
                            }
                            UpdataUserList(message)
                            turnOffDevice();
                            localAudioTrack.setMuted(true);
                        }
                    }
                >
                    Switch back
                </Button>
            }
            </Stack>
        </div>
        <Prompt
            message={() => {
                leave().then(() => {
                    CloseSocket(username + "_meeting")
                    ExitRoom(username, keys[len - 1])
                    .then(
                        (response) => {
                            console.log("exit success!")
                        }
                    )
                }
                )
            }}
        />
        </div>
    );
}

export function useGlobalTrack(){
    return [useContext(VideoTrackContext), useContext(AudioTrackContext), useContext(SetCameraIdContext)];
}

export default MeetingPage;

function scrollToBottom(){
    let div = document.getElementById('gglol');
    div.scrollTop = div.scrollHeight+50;
}
function ConfirmDialog(message) {
    const info = message.message
    const setOpen = useContext(SetDialogOpenContext);
    return (
        <Dialog
        open={true}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
         Error
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          {info}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick = {
                () => {
                    setOpen(false)
                }
            }
          >
              Confirm
          </Button>
        </DialogActions>
      </Dialog>
    );
}
