import React from 'react'

const RuleHelp = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2>精算ルールの方法設定</h2>
                <ul style={styles.left}>
                    <li>精算ルールには精算の際に考慮が必要なルールを設定します。</li>
                    <li>例１：支払の最小単位は100円とする。端数は○○が支払う。</li>
                    <li>例２：○○の支払金額は○○の支払金額の2倍未満とする。</li>
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

export default RuleHelp;
