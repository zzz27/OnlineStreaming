import { useState } from 'react';
import './signup.component.css';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Modal, Stack, Alert } from '@mui/material';
import TextField from '@mui/material/TextField';
import './roomList.css';
import cookies from 'react-cookies';
import { useHistory } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import Select from '@mui/material/Select';
import { GetRoomList, CheckRoom } from '../communication/communication';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import ArrowCircleDownOutlinedIcon from '@mui/icons-material/ArrowCircleDownOutlined';

export function RoomList() {
    const { isAdmin, username } = cookies.load('userData');

    const [roomList, setRoomList] = useState([]);
    const [allroomList, setAllRoomList] = useState([]);
    const [openDetail, setOpenDetail] = useState(false);
    const [roomDetail, setRoomDetail] = useState([]);
    const [showPopUp, setShowPopUp] = useState(false);
    const [popUp, setPopUp] = useState('error');
    const [alterText, setAlterText] = useState('');
    const history = useHistory();

    const [searchKey, setSearchKey] = useState('');
    const [role, setRole] = useState('');
    const [type, setType] = useState('');

    const handleRoleChange = (event) => {
        setRole(event.target.value);
    };

    const handleTypeChange = (event) => {
        setType(event.target.value);
    };

    const handleCloseDetail = () => {
        setOpenDetail(false);
    }

    const handleOpenDatail = (roomId) => {
        const currentRoom = roomList.find((roomDetail) => roomDetail.roomId === roomId);
        setRoomDetail(roomList.find((roomDetail) => roomDetail.roomId === roomId));
        setOpenDetail(true);
    };
    
    
    const [Init, setInit] = useState(false);
    if (Init === false) {
        const message = {
            username : username
        }
        GetRoomList(username, "list")
        .then(
            (list) => {
                setRoomList(list)
                setAllRoomList(list)
            }
        )
        .catch(
            (responce) => {}
        )
        setInit(true)
    };

    return (
        <div className="auth-wrapper">
            {showPopUp && (
                <Alert
                    severity={popUp}
                    onClose={() => {
                        setShowPopUp(false);
                    }}
                >
                    {alterText}
                </Alert>
            )}
            
            <div className="auth-inner">
            <h3>My Room</h3>
            <div className="search">
                <TextField
                    sx = {{width:"80%"}}
                    id="standard-search"
                    label="Search key"
                    type="search"
                    variant="standard"
                    onChange={(event) => {
                        setSearchKey(event.target.value);
                    }}
                />
                <IconButton 
                    type="submit" 
                    sx={{ p: '20px' }} 
                    aria-label="search"
                    onClick={
                        ()=>{
                            let currentRoomList = []
                            const len = allroomList.length
                            for(let i = 0; i < len; i = i + 1) {
                                if(searchKey !== "" && allroomList[i].roomName.indexOf(searchKey) === -1) continue
                                if(checkRole(allroomList[i], role, username) === false) continue
                                if(checkType(allroomList[i], type) === false) continue
                                currentRoomList.push(allroomList[i])
                            }
                            setRoomList(currentRoomList)
                    }}>
                    <SearchIcon />
                </IconButton>
                    <FormControl 
                        variant="standard" 
                        sx={{ 
                            m: 0, 
                            minWidth: 120,
                            marginRight: 4,
                        }}>
                        <InputLabel id="demo-simple-select-standard-label">Role</InputLabel>
                            <Select
                                labelId="demo-simple-select-standard-label"
                                id="demo-simple-select-standard"
                                value={role}
                                onChange={handleRoleChange}
                                label="Role"
                            >
                                <MenuItem value={1}>all</MenuItem>
                                <MenuItem value={2}>host</MenuItem>
                                <MenuItem value={3}>audience</MenuItem>
                                <MenuItem value={4}>guest</MenuItem>
                            </Select>
                    </FormControl>
                    <FormControl variant="standard" sx={{ m: 0, minWidth: 120 }}>
                        <InputLabel id="demo-simple-select-standard-label">Type</InputLabel>
                            <Select
                                labelId="demo-simple-select-standard-label"
                                id="demo-simple-select-standard"
                                value={type}
                                onChange={handleTypeChange}
                                label="Type"
                            >
                                <MenuItem value={1}>all</MenuItem>
                                <MenuItem value={2}>core</MenuItem>
                                <MenuItem value={3}>elective</MenuItem>
                                <MenuItem value={4}>others</MenuItem>
                            </Select>
                    </FormControl>
            </div>
            <List
                sx={{ 
                    width: '100%', 
                    maxWidth: 360, 
                    bgcolor: 'background.paper',
                    overflow: 'auto',
                    maxHeight: 300,
                }}
            >
            <Stack>
                {roomList.map((value) => (
                    <ListItem
                        key={value.roomId}
                        disableGutters
                        secondaryAction={
                            <div>
                            {(value.roomRole === "audience" || value.roomRole === "guest") && value.state === "OFF" &&
                                <Tooltip title="OFF">
                                    <CloudOffIcon
                                        sx = {{
                                            marginRight:1
                                        }}
                                    />
                                </Tooltip>
                            }
                            {(value.roomRole === "audience" || value.roomRole === "guest") && value.state === "ON" && 
                                <Tooltip title="ON">
                                    <CloudQueueIcon
                                        sx = {{
                                            marginRight:1
                                        }}
                                    />
                                </Tooltip>
                            }
                            {value.roomRole !== "audience" && 
                                <Tooltip title="download history record">
                                <IconButton>
                                    <ArrowCircleDownOutlinedIcon
                                        onClick={() => {
                                            download_txt(value.roomName+"_room_chatroom_historyrecord.txt",value.historyRecord)
                                        }}
                                    />
                                </IconButton>
                                </Tooltip>
                            }
                                <Tooltip title="room detail">
                                <IconButton>
                                        <VisibilityIcon
                                            onClick={() => {
                                                handleOpenDatail(value.roomId)
                                            }}
                                        />
                                </IconButton>
                                </Tooltip>
                                
                                <Tooltip title="join room">
                                <IconButton>
                                    <ArrowBackIcon
                                        onClick={() => {
                                            CheckRoom(username, value.roomId)
                                            .then(
                                                (response) => {
                                                    history.push(
                                                        `/meeting/${value.roomId}`
                                                    );
                                                }
                                            )
                                            .catch(
                                                (response) => {
                                                    console.log(response.data)
                                                    setPopUp('error');
                                                    setAlterText(response.data.data);
                                                    setShowPopUp(true);
                                                }
                                            )
                                    }}
                                    />
                                </IconButton>
                                </Tooltip>
                            </div>
                        }
                    >
                        <ListItemText primary={`${value.roomName}  (${value.roomRole})`} />
                    </ListItem>
                ))}
                </Stack>
            </List>
            {openDetail && (
                <Modal
                    open={openDetail}
                    onClose={handleCloseDetail}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <div className="auth-inner1">
                        <RoomDetail roomDetail={roomDetail} />
                    </div>
                </Modal>
            )}
            </div>
        </div>
    );
}

function download_txt(filename, text) {
    let pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    if (document.createEvent) {
        let event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
}

function RoomDetail(roomDetail) {
    let roomInfo = roomDetail.roomDetail;
    return (
        <Stack
            component="form"
            direction="row"
            sx={{
                width: '70ch'
            }}
            spacing={10}
            noValidate
            autoComplete="off"
        >
            
        <List
          sx={{
            width: '100%',
            maxWidth: 480,
            bgcolor: 'background.paper',
          }}
        >
          <ListItem>
            <ListItemText primary="Room Name" secondary={roomInfo.roomName}  />
          </ListItem>
          <Divider component="li" />
          <li>
            <Typography
              sx={{ mt: 0.5, ml: 2 }}
              color="text.secondary"
              display="block"
              variant="caption"
            />
          </li>
          <ListItem>
            <ListItemText primary="Room Id" secondary={roomInfo.roomId} />
          </ListItem>
          <Divider component="li"/>
          <li>
            <Typography
              sx={{ mt: 0.5, ml: 2 }}
              color="text.secondary"
              display="block"
              variant="caption"
            />
          </li>
          <ListItem>
            <ListItemText primary="Like Number" secondary={roomInfo.likeNumber}  />
          </ListItem>
          <Divider component="li" />
          <li>
            <Typography
              sx={{ mt: 0.5, ml: 2 }}
              color="text.secondary"
              display="block"
              variant="caption"
            />
          </li>
          <ListItem>
            <ListItemText primary="Is Private" secondary={roomInfo.isPrivate.toString() === "true" ? "yes" : "no"}  />
          </ListItem>
          <Divider component="li" />
          <li>
            <Typography
              sx={{ mt: 0.5, ml: 2 }}
              color="text.secondary"
              display="block"
              variant="caption"
            />
          </li>
          
        </List>


        <List
          sx={{
            width: '100%',
            maxWidth: 480,
            bgcolor: 'background.paper',
          }}
        >
          <ListItem>
            <ListItemText primary="Streamer" secondary={roomInfo.streamer}  />
          </ListItem>
          <Divider component="li" />
          <li>
            <Typography
              sx={{ mt: 0.5, ml: 2 }}
              color="text.secondary"
              display="block"
              variant="caption"
            />
          </li>
          <ListItem>
            <ListItemText primary="Course Type" secondary={roomInfo.type}  />
          </ListItem>
          <Divider component="li" />
          <li>
            <Typography
              sx={{ mt: 0.5, ml: 2 }}
              color="text.secondary"
              display="block"
              variant="caption"
            />
          </li>
        </List>
        </Stack>
      );
}

function checkRole(room, role, username) {
    if(role === 2 && room.streamer !== username) 
        return false
    if(role === 3 && (room.streamer === username || room.userIsGuest === true))
        return false
    if(role === 4 && (room.streamer === username || room.userIsGuest === false))
        return false
    return true
}

function checkType(room, type) {
    if(type === 2 && (room.type === "elective" || room.type === "others"))
        return false
    if(type === 3 && (room.type === "core" || room.type === "others"))
        return false
    if(type === 4 && (room.type === "core" || room.type === "elective"))
        return false
    return true
}

export default RoomList;