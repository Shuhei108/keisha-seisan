const EarchPayment = ({ participants }) => {
    return (
        <tbody>
            {participants.map((participant) => {
                return (
                    <tr key={participant.id}>
                        <td>{participant.name}</td>
                        <td>{participant.payment}円</td>
                    </tr>
                )
            })}
        </tbody>
    )
}

export default EarchPayment;