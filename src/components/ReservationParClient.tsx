import { TableCell } from '@/components/ui/table'
import api from '@/lib/api';
import { useEffect, useState } from 'react'

export default function ReservationParClient({ ...props }) {

    const [countResParClient, setCountResParClient] = useState<number>(0);

    const getReservationCountForClient = async (): Promise<any> => {
        await api.get(`/reservations/nombre-client/${props.clientId}`)
            .then((res) => setCountResParClient(res.data))
            .catch((err) => { console.error(err) });
    };

    useEffect(() => {
        getReservationCountForClient();
    }, [props.clientId])

    return <TableCell>{countResParClient}</TableCell>

}