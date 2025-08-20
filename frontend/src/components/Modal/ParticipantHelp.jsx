import React from 'react'

const ParticipantHelp = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2>参加者の設定方法</h2>
                <ul style={styles.left}>
                    <li>「職位」には役職や人名を入力します。</li>
                    <li>「人数」には職位の人数を入力します。</li>
                    <li>「重みづけ」はその職位が支払う割合をだいたいで設定します。</li>
                    <li>参加者は「+」ボタンで追加、「-」ボタンで削除できます。</li>
                </ul>
                <button onClick={onClose}>閉じる</button>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        width: '450px',
        textAlign: 'center'
    },
    left: {
        textAlign: 'left'
    }
};

export default ParticipantHelp;
