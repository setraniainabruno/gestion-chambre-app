import { UserCheck } from 'lucide-react'
import React from 'react'

function ClientReservation({ ...props }) {
    return (
        < div className="flex items-center" >
            <div className={`w-9 h-9 rounded ${props.bgColor} flex items-center justify-center mr-3`}>
                <UserCheck className={`h-5 w-5 ${props.color}`} />
            </div>
            <div>
                <p className="text-sm font-medium">{props.clientNom} {props.clientPrenom}</p>
                <p className="text-xs text-muted-foreground">Chambre {props.chambreNumero} - {props.chambreType}</p>
            </div>
        </div>
    )
}

export default ClientReservation