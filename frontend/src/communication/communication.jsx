import axios from 'axios'
import CryptoJS  from "crypto-js"

const REGISTER_URL = '/api/register';
const LOGIN_URL = '/api/login';
const CREATE_URL = '/api/create_room';
const EDIT_URL = '/api/edit_room';
const ALL_USERS_URL = '/api/all_users_name';
const GET_USER_ROOM_URL = '/api/get_user_room';
const DELETE_ROOM_URL = '/api/delete_room';
const CHECK_ROOM_URL = '/api/check_room';
const JOIN_URL = '/api/join_room';
const EXIT_URL = '/api/exit_room';
const THUMP_UP_URL = '/api/thumb_up';
const SOCKET_CLOSE_URL = '/api/close_socket';
const SEND_MESSAGE_URL = '/api/send_message';
const LOGOUT_URL = '/api/logout';
const UPDATE_USER_LIST_URL = '/api/update_room_list';
const KICK_OUT_URL = '/api/kick_out_room'
const SHUT_UP_URL = '/api/shut_up_user'
const GET_TOKEN_URL = '/api/token'
const BE_HOST_URL = '/api/be_host'
const BE_AUDIENCE_URL = '/api/be_audience'


export const SignUp = (username, password) => {
    const key =  CryptoJS.enc.Base64.parse('YCFyMTG5NTYxYzlmZTA2OA==')
    const result = CryptoJS.AES.encrypt(password, key,{ 
            iv: key,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7  
    });
    const pwd = result.ciphertext.toString()
    const message = {
        username:username,
        password:pwd
    }
    return new Promise((resolve, reject) => {
        axios
        .post(REGISTER_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const SignIn = (username, password) => {
    const key =  CryptoJS.enc.Base64.parse('YCFyMTG5NTYxYzlmZTA2OA==')
    const result = CryptoJS.AES.encrypt(password, key, {
        iv: key,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    const pwd = result.ciphertext.toString();
    const message = {
        username: username,
        password: pwd
    };
    return new Promise((resolve, reject) => {
        axios
        .post(LOGIN_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const CheckRoom = (username, roomId) => {
    const message = {
        username : username,
        roomId : roomId
    }

    return new Promise((resolve, reject) => {
        axios
        .post(CHECK_ROOM_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const GetRoomList = (username, getType) => {
    const message = {
        username : username,
        getType : getType
    }

    return new Promise((resolve, reject) => {
        axios
        .post(GET_USER_ROOM_URL, JSON.stringify(message))
        .then(
            (response) => {
                const dataList = response.data.data
                const length = dataList.length
                let list = []
                
                for(let i = 0; i < length; i++) {
                    const Room = {
                        roomId : dataList[i].roomId,
                        roomName : dataList[i].roomName,
                        likeNumber : dataList[i].likeNumber,
                        isPrivate : dataList[i].isPrivate,
                        streamer : dataList[i].streamer,
                        state : dataList[i].state,
                        type : dataList[i].type,
                        permitUserList : dataList[i].permitUserList,
                        historyRecord : dataList[i].historyRecord,
                        guestList : dataList[i].guestList,
                        userIsGuest : dataList[i].isGuest,
                        roomRole : (dataList[i].streamer === username) ? "host" : (dataList[i].isGuest ? "guest" : "audience"),
                    }
                    list.push(Room)
                }
                resolve(list)
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const DeleteRoom = (username, roomId) => {
    const message = {
        username : username,
        roomId : roomId
    }

    return new Promise((resolve, reject) => {
        axios
        .post(DELETE_ROOM_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const JoinRoom = (username, roomId, role) => {
    const message = {
        username: username,
        roomId: roomId,
        role: role
    }
    return new Promise((resolve, reject) => {
        axios
        .post(JOIN_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });

}


export const ExitRoom = (username, roomId) => {
    const message = {
        username: username,
        roomId: roomId,
    }
    return new Promise((resolve, reject) => {
        axios
        .post(EXIT_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const ThumpUpRoom = (roomId) => {
    const message = {
        roomId: roomId
    }
    return new Promise((resolve, reject) => {
        axios
        .post(THUMP_UP_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const CloseSocket = (username) => {
    const message = {
        username: username
    }
    return new Promise((resolve, reject) => {
        axios
        .post(SOCKET_CLOSE_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const Logout = (username) => {
    const message = {
        username: username
    }
    return new Promise((resolve, reject) => {
        axios
        .post(LOGOUT_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const GetAllUsers = () => {
    return new Promise((resolve, reject) => {
        axios
        .get(ALL_USERS_URL)
        .then(
            (response) => {
                const dataList = response.data.data
                const length = dataList.length
                let list = []
                for(let i = 0; i < length; i++) {
                    const user = {
                        username : dataList[i].username,
                    }
                    list.push(user)
                }
                resolve(list)
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const CreateRoom = (message) => {
    return new Promise((resolve, reject) => {
        axios
        .post(CREATE_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const EditRoom = (message) => {
    return new Promise((resolve, reject) => {
        axios
        .post(EDIT_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const SendMessage = (message) => {
    return new Promise((resolve, reject) => {
        axios
        .post(SEND_MESSAGE_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const UpdataUserList = (message) => {
    return new Promise((resolve, reject) => {
        axios
        .post(UPDATE_USER_LIST_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const KictOutUser = (message) => {
    return new Promise((resolve, reject) => {
        axios
        .post(KICK_OUT_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const ShutUpUser = (username, roomId) => {
    
    const message = {
        username : username,
        roomId : roomId
    }

    return new Promise((resolve, reject) => {
        axios
        .post(SHUT_UP_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const GetToken = (roomId, role) => {
    const message = {
        roomId: roomId,
        role: role
    }
    return new Promise((resolve, reject) => {
        axios
        .post(GET_TOKEN_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const BeHost = (username, roomId) => {
    const message = {
        username : username,
        roomId : roomId
    }
    return new Promise((resolve, reject) => {
        axios
        .post(BE_HOST_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}


export const BeAudience = (username, roomId) => {
    const message = {
        username : username,
        roomId : roomId
    }
    return new Promise((resolve, reject) => {
        axios
        .post(BE_AUDIENCE_URL, JSON.stringify(message))
        .then(
            (response) => {
                resolve(response);
            }
        )
        .catch(
            (error) => {
                reject(error.response)
            }
        )
    });
}