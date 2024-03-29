import { useEffect, useState } from 'react';
import styles from './InfoDetailUser.module.scss';
import classNames from 'classnames/bind';
import { AuthContext } from '../../../../context/AuthContext';
import { useContext } from 'react';
import axiosCilent from '../../../../api/axiosClient';
import { io } from 'socket.io-client';
import apiConfig from '../../../../api/apiConfig';
const socket = io.connect(apiConfig.baseUrl, { transports: ['websocket'] });

const cx = classNames.bind(styles);

const InfoDetailUser = ({ ava, name, id, onclick = () => {} }) => {
    const { user, dispatch } = useContext(AuthContext);
    const [awaitAceept, setAwaitAccept] = useState(false);
    const [isFriend, setIsFriend] = useState(false);

    useEffect(() => {
        const StateAwait = async () => {
            const res = await axiosCilent.get(`/zola/users/${user.id}`);
            const arrTemp = res.listSender;
            if (arrTemp.includes(id)) setAwaitAccept(true);
            if (res.friends.includes(id)) setIsFriend(true);
        };
        StateAwait();
    }, []);

    const handleAddFriend = async () => {
        const req = {
            userId: user.id,
            friendId: id,
            listSender: user.listSender,
        };
        try {
            await axiosCilent.put('/zola/users/friends', req);
            const res = await axiosCilent.get(`/zola/users/${user.id}`);
            dispatch({ type: 'LOGIN_SUCCESS', payload: res });
            socket.emit('request-friend', {
                listUser: [user.id, id],
            });
            setAwaitAccept(true);
        } catch (error) {
            console.log(error);
        }
    };

    const handleCaccelFriend = async () => {
        const req = {
            userId: user.id,
            friendId: id,
            listSender: user.listSender,
        };
        try {
            await axiosCilent.put('/zola/users/cancelFriend', req);
            const res = await axiosCilent.get(`/zola/users/${user.id}`);
            dispatch({ type: 'LOGIN_SUCCESS', payload: res });
            socket.emit('request-friend', {
                listUser: [user.id, id],
            });
            setAwaitAccept(true);
        } catch (error) {
            console.log(error);
        }
        setAwaitAccept(false);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('info')}>
                <div className={cx('ava')}>
                    <img src={ava} alt="" />
                </div>
                <span>{name}</span>
            </div>
            {!isFriend && !awaitAceept && (
                <button className={cx('btn-add-frend')} onClick={handleAddFriend}>
                    Kết bạn
                </button>
            )}
            {!isFriend && awaitAceept && (
                <button className={cx('btn-cancle-frend')} onClick={handleCaccelFriend}>
                    Hủy lời mời
                </button>
            )}
            {isFriend && (
                <div className={cx('btns')}>
                    <button className={cx('btn-frend')}>Bạn bè</button>
                    <button className={cx('btn-chat')} onClick={() => onclick()}>
                        Nhắn tin
                    </button>
                </div>
            )}
        </div>
    );
};

export default InfoDetailUser;
