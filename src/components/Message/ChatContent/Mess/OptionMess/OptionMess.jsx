import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faEllipsisVertical, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import Tippy from '@tippyjs/react/headless';
import style from './OptionMess.module.scss';
import classNames from 'classnames/bind';
import Modal from 'react-modal';
import UserItemSearch from '../../../ChatList/UserItemSearch/UserItemSerach';
import axiosCilent from '../../../../../api/axiosClient';
import { io } from 'socket.io-client';
import { useContext } from 'react';
import { AuthContext } from '../../../../../context/AuthContext';
import apiConfig from '../../../../../api/apiConfig';
const socket = io.connect(apiConfig.baseUrl, { transports: ['websocket'] });

const cx = classNames.bind(style);

const customStyles = {
    content: {
        padding: '0',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};
const OptionMess = ({ noOwn, conversation, mess }) => {
    const { user } = useContext(AuthContext);
    const [showMore, setShowMore] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const openModal = () => {
        setModalIsOpen(true);
        setShowMore(false);
    };
    const closeModal = () => {
        setModalIsOpen(false);
    };

    const recoverMess = async () => {
        try {
            await axiosCilent.put('/zola/message/recoverMess', { id: mess.id });
            socket.emit('remove-to-server', {
                senderId: user.id,
                conversationID: mess.conversationID,
            });
        } catch (error) {
            console.log(error);
        }
    };

    const delMess = async () => {
        const req = { id: mess.id, userId: user.id };
        try {
            await axiosCilent.put('/zola/message/deleteMess', req);
            socket.emit('send-to-server', {
                conversationID: mess.conversationID,
            });
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <Tippy
            visible={showMore}
            interactive={true}
            render={(attrs) => (
                <ul className={cx('wrapper-more')} tabIndex="-1" {...attrs}>
                    {!noOwn && <li onClick={recoverMess}>Thu hồi</li>}
                    <li onClick={openModal}>Chuyển tiếp</li>
                    <li onClick={delMess}>Xóa</li>
                    <Modal isOpen={modalIsOpen} style={customStyles} onRequestClose={closeModal} ariaHideApp={false}>
                        <div className={cx('wrapper-modal')}>
                            <div className={cx('header-md')}>
                                <span className={cx('title')}>Chuyển tiếp </span>
                                <FontAwesomeIcon icon={faXmark} className={cx('close-md')} onClick={closeModal} />
                            </div>
                            <div className={cx('body-md')}>
                                {conversation?.map((c, i) => (
                                    <UserItemSearch key={i} mess={mess} con={c} button="Gửi" />
                                ))}
                            </div>
                        </div>
                    </Modal>
                </ul>
            )}
        >
            <div onClick={() => setShowMore(!showMore)}>
                <FontAwesomeIcon
                    icon={faEllipsisVertical}
                    className={cx('icon-more')}
                    style={{ color: '#ccc', fontSize: '25', margin: '0 10', cursor: 'pointer' }}
                />
            </div>
        </Tippy>
    );
};

export default OptionMess;
