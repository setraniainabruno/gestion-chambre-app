import api from '@/lib/api';
import { useEffect, useState } from 'react'

export default function ChambreParStatus({ ...props }) {

    const [countChambre, setCountChambre] = useState<number>(0);
    const getChambreParStatus = async () => {

        await api.get(`chambres/statut/${props.status}`)
            .then((res) => setCountChambre(res.data))
            .catch((error) => console.error(error))
    };

    useEffect(() => {
        getChambreParStatus();
    }, [])
    return (
        <div className="flex justify-between items-center">
            <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${props.bgColor} mr-2`}></div>
                <span>{countChambre < 2 ? props.status : `${props.status}s`}</span>
            </div>
            <span className="font-medium">{countChambre}</span>
        </div>
    )
}
