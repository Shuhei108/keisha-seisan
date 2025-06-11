import React from 'react'

const RuleHelp = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2>このサイトについて</h2>
                <div style={styles.left}>
                    <p>このサイトは、参加者情報・ルール・支払金額を入力するだけで、AIが自動的に傾斜配分を行い、清算金額を計算するサービスです。</p>
                    <p>不公平感の少ない合理的な金額算出をサポートし、集計や調整の手間を軽減します。</p>
                    <p>面倒な計算はすべておまかせください。</p>
                    <p></p>
                </div>
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

export default RuleHelp;
