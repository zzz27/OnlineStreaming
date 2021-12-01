import { makeStyles } from '@material-ui/core/styles';

export function getStyles(){
    return makeStyles({
        menu: {
            height: '150px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        },
        customBtn: {
            width: '50px',
            height: '50px',
            marginLeft: '20px',
            borderRadius: '26px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backgroundSize: '50px',
            cursor: 'pointer'
        },
        leftAlign: {
            display: 'flex',
            flex: '1',
            justifyContent: 'space-evenly'
        },
        rightAlign: {
            display: 'flex',
            flex: '1',
            justifyContent: 'center'
        },
        menuContainer: {
            width: '100%',
            height: '100%',
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            zIndex: '2'
        }
    });
}
