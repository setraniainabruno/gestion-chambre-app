import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function CardComponent({ ...props }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{props.title}</CardTitle>
                {props.icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{props.valeur}{props.unite}</div>
            </CardContent>
        </Card>
    )
}

export default CardComponent