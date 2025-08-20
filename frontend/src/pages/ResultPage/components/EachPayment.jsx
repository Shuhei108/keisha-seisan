const EarchPayment = ({ participants }) => {
    return (
        <>
            {participants.map((participant) => {
                return (
                    <tr key={participant.id}>
                        <td>{participant.name}</td>
                        <td>{participant.payment}円</td>
                    </tr>
                )
            })}
        </>
    )
}

export default EarchPayment;