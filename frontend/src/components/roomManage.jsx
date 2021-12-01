import React, { useState, useContext } from 'react';
import './roomManage.css';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Tooltip from '@material-ui/core/Tooltip';
import SearchIcon from '@mui/icons-material/Search';
import {
    Autocomplete,
    Button,
    FormControlLabel,
    FormControl,
    Modal,
    Stack,
    Alert,
    RadioGroup,
    Radio,
    FormLabel
} from '@mui/material';
import TextField from '@mui/material/TextField';
import cookies from 'react-cookies';
import { useHistory } from 'react-router-dom';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {
    DeleteRoom,
    GetRoomList,
    GetAllUsers,
    CreateRoom,
    EditRoom,
    CheckRoom
} from '../communication/communication';

const SetOpenContext = React.createContext();
const SetDialogContext = React.createContext();
const SetAllListContext = React.createContext();
const SetRoomListContext = React.createContext();

export function RoomManage() {
    const { isAdmin, username } = cookies.load('userData');

    const [roomList, setRoomList] = useState([]);
    const [allroomList, setAllRoomList] = useState([]);
    const [openEditer, setOpenEditer] = useState(false);
    const [openDetail, setOpenDetail] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [roomEditer, setRoomEditer] = useState([]);
    const [roomDetail, setRoomDetail] = useState([]);
    const [showPopUp, setShowPopUp] = useState(false);
    const [popUp, setPopUp] = useState('error');
    const [alterText, setAlterText] = useState('');
    const history = useHistory();

    const [searchKey, setSearchKey] = useState('');

    const handleCloseEditer = () => {
        setOpenEditer(false);
        GetRoomList(username, 'manage').then((list) => {
            setRoomList(list);
            setAllRoomList(list);
        });
    };

    const handleCloseDetail = () => {
        setOpenDetail(false);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleOpenEditer = (roomId) => {
        const currentRoom = roomList.find((roomEditer) => roomEditer.roomId === roomId);
        setRoomEditer(roomList.find((roomEditer) => roomEditer.roomId === roomId));
        setOpenEditer(true);
    };

    const handleOpenDatail = (roomId) => {
        const currentRoom = roomList.find((roomDetail) => roomDetail.roomId === roomId);
        setRoomDetail(roomList.find((roomDetail) => roomDetail.roomId === roomId));
        setOpenDetail(true);
    };

    const handleOpenDialog = (roomId) => {
        const currentRoom = roomList.find((roomDetail) => roomDetail.roomId === roomId);
        setRoomDetail(roomList.find((roomDetail) => roomDetail.roomId === roomId));
        setOpenDialog(true);
    };

    const initRoomInfo = {
        roomName: '',
        roomId: -1,
        isPrivate: false,
        streamer: '',
        permitUserList: [],
        guestList: [],
        type: 'core'
    };

    const [Init, setInit] = useState(false);

    if (Init === false) {
        GetRoomList(username, 'manage').then((list) => {
            setRoomList(list);
            setAllRoomList(list);
        });
        setInit(true);
    }

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
                <h3>Room Manage</h3>
                <TextField
                    sx={{ width: '80%' }}
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
                    onClick={() => {
                        let currentRoomList = [];
                        const len = allroomList.length;
                        for (let i = 0; i < len; i = i + 1) {
                            if (
                                searchKey !== '' &&
                                allroomList[i].roomName.indexOf(searchKey) === -1
                            )
                                continue;
                            currentRoomList.push(allroomList[i]);
                        }
                        setRoomList(currentRoomList);
                    }}
                >
                    <SearchIcon />
                </IconButton>
                <List
                    sx={{
                        width: '100%',
                        maxWidth: 360,
                        bgcolor: 'background.paper',
                        overflow: 'auto',
                        maxHeight: 300
                    }}
                >
                    <Stack>
                        {roomList.map((value) => (
                            <ListItem
                                key={value.roomId}
                                disableGutters
                                secondaryAction={
                                    <div>
                                        {(value.roomRole === 'audience' ||
                                            value.roomRole === 'guest') &&
                                            value.state === 'OFF' && (
                                                <Tooltip title="OFF">
                                                    <CloudOffIcon
                                                        sx={{
                                                            marginRight: 1
                                                        }}
                                                    />
                                                </Tooltip>
                                            )}
                                        {(value.roomRole === 'audience' ||
                                            value.roomRole === 'guest') &&
                                            value.state === 'ON' && (
                                                <Tooltip title="ON">
                                                    <CloudQueueIcon
                                                        sx={{
                                                            marginRight: 1
                                                        }}
                                                    />
                                                </Tooltip>
                                            )}
                                        {isAdmin && (
                                            <Tooltip title="edit room">
                                                <IconButton>
                                                    <EditIcon
                                                        onClick={() => {
                                                            handleOpenEditer(value.roomId);
                                                        }}
                                                    />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {isAdmin && (
                                            <Tooltip title="delete room">
                                                <IconButton>
                                                    <DeleteIcon
                                                        onClick={() => {
                                                            handleOpenDialog(value.roomId);
                                                        }}
                                                    />
                                                </IconButton>
                                            </Tooltip>
                                        )}

                                        <Tooltip title="room detail">
                                            <IconButton>
                                                <VisibilityIcon
                                                    onClick={() => {
                                                        handleOpenDatail(value.roomId);
                                                    }}
                                                />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="join room">
                                            <IconButton>
                                                <ArrowBackIcon
                                                    onClick={() => {
                                                        CheckRoom(username, value.roomId)
                                                            .then((response) => {
                                                                const role = response.data.data;
                                                                history.push(
                                                                    `/meeting/${value.roomId}`
                                                                );
                                                            })
                                                            .catch((response) => {
                                                                console.log(response.data);
                                                                setPopUp('error');
                                                                setAlterText(response.data.data);
                                                                setShowPopUp(true);
                                                            });
                                                    }}
                                                />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                }
                            >
                                <ListItemText primary={`${value.roomName}`} />
                            </ListItem>
                        ))}
                    </Stack>
                </List>
                {openEditer && (
                    <Modal
                        open={openEditer}
                        onClose={handleCloseEditer}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <div className="auth-inner1">
                            <SetAllListContext.Provider value={setAllRoomList}>
                                <SetRoomListContext.Provider value={setRoomList}>
                                    <SetOpenContext.Provider value={setOpenEditer}>
                                        <RoomEditer roomDetail={roomEditer} />
                                    </SetOpenContext.Provider>
                                </SetRoomListContext.Provider>
                            </SetAllListContext.Provider>
                        </div>
                    </Modal>
                )}

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

                {openDialog && (
                    <Modal
                        open={openDialog}
                        onClose={handleCloseDialog}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <SetAllListContext.Provider value={setAllRoomList}>
                            <SetRoomListContext.Provider value={setRoomList}>
                                <SetDialogContext.Provider value={setOpenDialog}>
                                    <ConfirmDialog roomDetail={roomDetail} />
                                </SetDialogContext.Provider>
                            </SetRoomListContext.Provider>
                        </SetAllListContext.Provider>
                    </Modal>
                )}

                <Button
                    sx={{ marginTop: '10px' }}
                    variant="contained"
                    onClick={() => {
                        setRoomEditer(initRoomInfo);
                        setOpenEditer(true);
                    }}
                >
                    Create Room
                </Button>
            </div>
        </div>
    );
}

function RoomEditer(roomDetail) {
    let roomInfo = roomDetail.roomDetail;
    const [userList, setUserList] = useState([]);
    const [Init, setInit] = useState(false);
    const [showPopUp, setShowPopUp] = useState(false);
    const [popUp, setPopUp] = useState('error');
    const [alterText, setAlterText] = useState('');
    const setOpen = useContext(SetOpenContext);
    const setAllRoomList = useContext(SetAllListContext);
    const setRoomList = useContext(SetRoomListContext);

    const { isAdmin, username } = cookies.load('userData');

    if (Init === false) {
        GetAllUsers().then((list) => {
            setUserList(list);
        });
        setInit(true);
    }

    const [roomName, setRoomName] = useState(roomInfo.roomName);
    const [streamer, setStreamer] = useState(roomInfo.streamer);
    const [isPrivate, setIsPrivate] = useState(roomInfo.isPrivate);
    const [type, setType] = useState(roomInfo.type);
    const [permitUserList, setPermitUserList] = useState(roomInfo.permitUserList);
    const [guestList, setGuestList] = useState(roomInfo.guestList);

    return (
        <Stack
            component="form"
            sx={{
                width: '25ch'
            }}
            spacing={2}
            noValidate
            autoComplete="off"
        >
            <h3>{roomInfo.roomId === -1 ? 'Create Room' : 'Edit Room'} </h3>

            <TextField
                id="standard-search"
                type="filled"
                variant="standard"
                label="Room Name"
                defaultValue={roomInfo.roomName}
                onChange={(event) => {
                    setRoomName(event.target.value);
                }}
            />

            <Autocomplete
                id="tags-standard"
                options={userList}
                getOptionLabel={(option) => option.username}
                defaultValue={{
                    username: roomInfo.streamer
                }}
                renderInput={(selectList) => (
                    <TextField
                        {...selectList}
                        variant="standard"
                        label="Streamer"
                        placeholder="Streamer"
                    />
                )}
                isOptionEqualToValue={(option, value) => {
                    return option.username === value.username;
                }}
                onChange={(event, newValue) => {
                    if (newValue !== null) setStreamer(newValue.username);
                    else setStreamer('');
                }}
            />

            <FormControl component="fieldset">
                <FormLabel component="legend">Is Private</FormLabel>
                <RadioGroup
                    row
                    aria-label="gender"
                    name="row-radio-buttons-group"
                    defaultValue={isPrivate ? 'yes' : 'no'}
                    onChange={() => {
                        setIsPrivate(!isPrivate);
                    }}
                >
                    <FormControlLabel value="no" control={<Radio />} label="no" />
                    <FormControlLabel value="yes" control={<Radio />} label="yes" />
                </RadioGroup>
            </FormControl>

            <FormControl component="fieldset">
                <FormLabel component="legend">Course Type</FormLabel>
                <RadioGroup
                    row
                    aria-label="gender"
                    name="row-radio-buttons-group"
                    defaultValue={roomInfo.type}
                    onChange={(event, newValue) => {
                        setType(newValue);
                    }}
                >
                    <FormControlLabel value="core" control={<Radio />} label="core" />
                    <FormControlLabel value="elective" control={<Radio />} label="elective" />
                </RadioGroup>
            </FormControl>

            <Autocomplete
                multiple
                id="tags-standard"
                options={userList}
                getOptionLabel={(option) => option.username}
                defaultValue={roomInfo.permitUserList}
                renderInput={(selectList) => (
                    <TextField
                        {...selectList}
                        variant="standard"
                        label="Audience List"
                        placeholder="Audience"
                    />
                )}
                isOptionEqualToValue={(option, value) => {
                    return option.username === value.username;
                }}
                onChange={(event, newValue) => {
                    setPermitUserList(newValue);
                }}
            />
            <Autocomplete
                multiple
                id="tags-standard"
                options={userList}
                getOptionLabel={(option) => option.username}
                defaultValue={roomInfo.guestList}
                renderInput={(selectList) => (
                    <TextField
                        {...selectList}
                        variant="standard"
                        label="Guest List"
                        placeholder="Guest"
                    />
                )}
                isOptionEqualToValue={(option, value) => {
                    return option.username === value.username;
                }}
                onChange={(event, newValue) => {
                    setGuestList(newValue);
                }}
            />

            <Stack spacing={2} direction="row">
                <Button
                    variant="contained"
                    onClick={() => {
                        console.log(permitUserList);
                        console.log(guestList);
                        const message = {
                            roomId: roomInfo.roomId,
                            roomName: roomName,
                            isPrivate: isPrivate,
                            permitUserList: permitUserList,
                            guestList: guestList,
                            type: type,
                            streamer: streamer,
                            username: username
                        };
                        if (roomName === '') {
                            console.log('RoomName should not be empty!');
                            setPopUp('error');
                            setAlterText('RoomName should not be empty!');
                            setShowPopUp(true);
                        } else if (streamer === '') {
                            console.log('Streamer should not be empty!');
                            setPopUp('error');
                            setAlterText('Streamer should not be empty!');
                            setShowPopUp(true);
                        } else {
                            if (roomInfo.roomId === -1) {
                                CreateRoom(message)
                                    .then((response) => {
                                        console.log('Creat room successfully!');
                                        setPopUp('success');
                                        setAlterText('Creat room successfully!');
                                        setShowPopUp(true);
                                        GetRoomList(username, 'manage').then((list) => {
                                            setRoomList(list);
                                            setAllRoomList(list);
                                        });
                                    })
                                    .catch((response) => {
                                        setPopUp('error');
                                        setAlterText(response.data.data);
                                        setShowPopUp(true);
                                    });
                            } else {
                                EditRoom(message)
                                    .then((response) => {
                                        console.log('Edit room successfully!');
                                        setPopUp('success');
                                        setAlterText('Edit room successfully!');
                                        setShowPopUp(true);
                                    })
                                    .catch((response) => {
                                        setPopUp('error');
                                        setAlterText(response.data.data);
                                        setShowPopUp(true);
                                    });
                            }
                        }
                    }}
                >
                    Confirm
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                        setOpen(false);
                    }}
                >
                    Close
                </Button>
            </Stack>

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
        </Stack>
    );
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
                    bgcolor: 'background.paper'
                }}
            >
                <ListItem>
                    <ListItemText primary="Room Name" secondary={roomInfo.roomName} />
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
                    <ListItemText primary="Like Number" secondary={roomInfo.likeNumber} />
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
                    <ListItemText
                        primary="Is Private"
                        secondary={roomInfo.isPrivate.toString() === 'true' ? 'yes' : 'no'}
                    />
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
                    bgcolor: 'background.paper'
                }}
            >
                <ListItem>
                    <ListItemText primary="Streamer" secondary={roomInfo.streamer} />
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
                    <ListItemText primary="Course Type" secondary={roomInfo.type} />
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

function ConfirmDialog(roomDetail) {
    const setOpen = useContext(SetDialogContext);
    const setAllRoomList = useContext(SetAllListContext);
    const setRoomList = useContext(SetRoomListContext);
    let roomInfo = roomDetail.roomDetail;
    const { isAdmin, username } = cookies.load('userData');
    return (
        <Dialog
            open={true}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                Are you sure you want to delete room {roomInfo.roomName}?
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    The consequences of this operation are irreversible!
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        setOpen(false);
                    }}
                >
                    Disagree
                </Button>
                <Button
                    onClick={() => {
                        console.log(username);
                        DeleteRoom(username, roomInfo.roomId).then((response) => {
                            console.log('Delete room successfully!');
                            GetRoomList(username, 'manage').then((list) => {
                                setRoomList(list);
                                setAllRoomList(list);
                            });
                        });
                        setOpen(false);
                    }}
                    autoFocus
                >
                    Agree
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default RoomManage;
