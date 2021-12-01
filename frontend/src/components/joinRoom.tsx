import { useState } from 'react';
import './joinRoom.css';
import { useHistory } from 'react-router-dom';
import cookies from 'react-cookies';
import { Alert, AlertColor, Button} from '@mui/material';
import TextField from '@mui/material/TextField';
import {CheckRoom} from '../communication/communication'

export function JoinRoom() {
    // eslint-disable-next-line no-param-reassign
    const [roomId, setRoomId] = useState('');
    const history = useHistory();
    const { isAdmin, username } = cookies.load('userData');
    const [showPopUp, setShowPopUp] = useState(false);
    const [popUp, setPopUp] = useState<AlertColor>('error');
    const [alterText, setAlterText] = useState('');

    return (
        <div className="auth-wrapper">
            { /* 提示栏 */ }
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
                <div className="RoomContainer">                    
                    <div className="JoinRoom">
                        <form>
                            <h3>JoinRoom</h3>
                            <TextField
                                sx = {{width:"100%"}}
                                id="standard-search"
                                label="Room Id"
                                type="search"
                                variant="standard"
                                onChange={(event) => {
                                    setRoomId(event.target.value);
                                }}
                            />

                            <div className="d-flex justify-content-center">
                                <div className="btn">
                                <Button
                                    sx={{marginTop:"10px"}}
                                    variant="contained"
                                    onClick={() => {
                                        if(roomId === '') {
                                            console.log('roomId should not be empty!');
                                            setPopUp('error');
                                            setAlterText('roomId should not be empty!');
                                            setShowPopUp(true);
                                        }
                                        else {
                                            CheckRoom(username, roomId)
                                            .then(
                                                (response) => {
                                                    history.push(`/meeting/${roomId}`);
                                                }
                                            )
                                            .catch(
                                                (response) => {
                                                    setPopUp('error');
                                                    setAlterText(response.data.data);
                                                    setShowPopUp(true);
                                                }
                                            )
                                        }
                                    }}
                                >
                                Join
                                </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default JoinRoom;
