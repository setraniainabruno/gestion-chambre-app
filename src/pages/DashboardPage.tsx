
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BedDouble, CalendarClock, UserCheck, TrendingUp } from 'lucide-react';
import ChambreParStatus from '../components/ChambreParStatus';
import { Chambre, ChambreStatus, ChambreType, Reservation, ReservationStatus } from '@/types';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { addDays, format, isToday } from 'date-fns';
import ClientReservation from '../components/ClientReservation';
import CardComponent from '../components/CardComponent';

const COLORS = ['#3b82f6', '#14b8a6', '#91a6f5', '#f59e0b', '#f74a4a'];




const DashboardPage = () => {
  const [simple, setSimple] = useState<number>(0);
  const [double, setDouble] = useState<number>(0);
  const [suite, setSuite] = useState<number>(0);
  const [familiale, setFamiliale] = useState<number>(0);
  const [deluxe, setDeluxe] = useState<number>(0);

  const [chambreDispo, setChambreDispo] = useState<number>(0);
  const [countRes, setCountRes] = useState<number>(0);
  const [revenus, setRevenus] = useState<number>(0);
  const [resAjourdHuit, setResAjourdHuit] = useState<number>(0);
  const [arriveeAjourdHuit, setArriveeAjourdHuit] = useState<number>(0);
  const [departAjourdHuit, setDepartAjourdHuit] = useState<number>(0);
  const [clienArriveeAjourdHuit, setClientArriveeAjourdHuit] = useState<Reservation[]>([]);
  const [clientDepartAjourdHuit, setClientDepartAjourdHuit] = useState<Reservation[]>([]);

  const [occupancyData, setOccupancyData] = useState<any[]>([])


  const getAllChambres = async () => {
    resetSetter();
    await api.get('/chambres')
      .then((res) => {
        const chambres = res.data;
        let c = 0;
        chambres.forEach((chambre: Chambre) => {
          switch (chambre.type) {
            case ChambreType.SIMPLE:
              setSimple(v => v + 1);
              break;
            case ChambreType.DOUBLE:
              setDouble(v => v + 1);
              break;
            case ChambreType.SUITE:
              setSuite(v => v + 1);
              break;
            case ChambreType.FAMILIALE:
              setFamiliale(v => v + 1);
              break;
            case ChambreType.DELUXE:
              setDeluxe(v => v + 1)
              break;
            default:
              break;
          }
          if (chambre.statut == ChambreStatus.DISPONIBLE) c++;

        });
        setChambreDispo(chambres.length == 0 ? 0 : Math.round((c / chambres.length) * 100));
      })

      .catch((error) => console.error(error))
  };


  const getCountRes = async () => {
    resetSetter();
    await api.get('/reservations/count')
      .then((res) => setCountRes(res.data))
      .catch((error) => console.error(error))
  };

  const getRevenus = async () => {
    resetSetter();
    await api.get('reservations')
      .then((res) => {
        const reservations = res.data;
        reservations.forEach((e: any) => {
          if (e.statut == ReservationStatus.CONFIRMEE || e.statut == ReservationStatus.TERMINEE) {
            setRevenus(rev => rev + e.prixTotal);
          }
        });
      })
      .catch((error) => console.error(error))
  };

  const getAllReservations = async () => {
    resetSetter();
    await api.get('/reservations')
      .then(async (res) => {
        res.data.forEach(async (e: Reservation) => {
          const dateArrivee = new Date(format(e.dateArrivee, 'MM/dd/yyyy'));
          const dateDepart = new Date(format(e.dateDepart, 'MM/dd/yyyy'));
          const aujourdHui = new Date(format(new Date(), 'MM/dd/yyyy'));
          if (e.statut != ReservationStatus.ANNULEE) {
            if (isToday(dateArrivee)) {
              setArriveeAjourdHuit(e => e + 1);
              setClientArriveeAjourdHuit((res) => [...res, e]);
            };
            if (isToday(dateDepart)) {
              setDepartAjourdHuit(e => e + 1);
              setClientDepartAjourdHuit((res) => [...res, e]);
            };
            if (aujourdHui < dateArrivee) setResAjourdHuit(e => e + 1);
          };
        })
      })
      .catch((error) => console.error(error))
  };

  const getReservation7DerniersJours = async () => {
    await api.get('/reservations')
      .then((res) => {
        const reservations = res.data;
        const aujourdHui = format(new Date(), 'MM/dd/yyyy');
        const j_1 = format(addDays(aujourdHui, -1), 'MM/dd/yyyy')
        const j_2 = format(addDays(aujourdHui, -2), 'MM/dd/yyyy')
        const j_3 = format(addDays(aujourdHui, -3), 'MM/dd/yyyy')
        const j_4 = format(addDays(aujourdHui, -4), 'MM/dd/yyyy')
        const j_5 = format(addDays(aujourdHui, -5), 'MM/dd/yyyy')
        const j_6 = format(addDays(aujourdHui, -6), 'MM/dd/yyyy')
        let c = 0;
        let c_1 = 0;
        let c_2 = 0;
        let c_3 = 0;
        let c_4 = 0;
        let c_5 = 0;
        let c_6 = 0;
        reservations.forEach((reservation: Reservation) => {
          const dateCreation = format(reservation.dateCreation, 'MM/dd/yyyy');
          switch (dateCreation) {
            case aujourdHui:
              c++;
              break;
            case j_1:
              c_1++;
              break;
            case j_2:
              c_2++;
              break;
            case j_3:
              c_3++;
              break;
            case j_4:
              c_4++;
              break;
            case j_5:
              c_5++;
              break;
            case j_6:
              c_6++
              break;

            default:
              break;
          }
        });
        setOccupancyData([
          { name: format(j_6, 'dd/MM'), value: c_6 },
          { name: format(j_5, 'dd/MM'), value: c_5 },
          { name: format(j_4, 'dd/MM'), value: c_4 },
          { name: format(j_3, 'dd/MM'), value: c_3 },
          { name: format(j_2, 'dd/MM'), value: c_2 },
          { name: format(j_1, 'dd/MM'), value: c_1 },
          { name: format(new Date(), 'dd/MM'), value: c },
        ])
      })
  };


  const resetSetter = () => {
    setArriveeAjourdHuit(0);
    setDepartAjourdHuit(0);
    setResAjourdHuit(0);
    setCountRes(0);
    setChambreDispo(0);
    setRevenus(0);
    setSimple(0);
    setDouble(0);
    setSuite(0);
    setFamiliale(0);
    setDeluxe(0);
    setClientArriveeAjourdHuit([]);
    setClientDepartAjourdHuit([]);

  }
  useEffect(() => {
    getReservation7DerniersJours();
    getRevenus();
    getCountRes();
    getAllChambres();
    getAllReservations();
  }, []);


  const roomTypeData = [
    { name: 'Simple', value: simple },
    { name: 'Double', value: double },
    { name: 'Suite', value: suite },
    { name: 'Familiale', value: familiale },
    { name: 'Deluxe', value: deluxe },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <CardComponent
          title='Taux du chambre dispo'
          valeur={chambreDispo}
          unite='%'
          icon={<BedDouble className="h-7 w-7 text-teal-500" />}
        />
        <CardComponent
          title='Revenu total'
          valeur={revenus}
          unite='Ar'
          icon={<TrendingUp className="h-7 w-7 text-blue-500" />}
        />
        <CardComponent
          title='Réservations'
          valeur={countRes}
          icon={<CalendarClock className="h-7 w-7 text-fuchsia-500" />}
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activité aujourd'hui</CardTitle>
            <UserCheck className="h-7 w-7 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Arrivées</p>
                <p className="text-xl font-bold">{arriveeAjourdHuit}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Départs</p>
                <p className="text-xl font-bold">{departAjourdHuit}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Réservations</p>
                <p className="text-xl font-bold">{resAjourdHuit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Occupation hebdomadaire</CardTitle>
            <CardDescription>Taux d'occupation des 7 derniers jours</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value}`} />
                  <Tooltip formatter={(value) => [`${value}`, 'Reservations']} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Répartition par type</CardTitle>
            <CardDescription>Occupation par type de chambre</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full max-w-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roomTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {roomTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Occupation']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Arrivées aujourd'hui</CardTitle>
            <CardDescription>Clients attendus aujourd'hui</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clienArriveeAjourdHuit.map((res) => (
                <ClientReservation
                  key={res.id}
                  color='text-blue-600'
                  bgColor='bg-blue-100'
                  clientNom={res.client.nom}
                  clientPrenom={res.client.prenom}
                  chambreNumero={res.chambre.numero}
                  chambreType={res.chambre.type}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Départs aujourd'hui</CardTitle>
            <CardDescription>Clients qui partent aujourd'hui</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clientDepartAjourdHuit.map((res) => (
                <ClientReservation
                  key={res.id}
                  color='text-amber-600'
                  bgColor='bg-amber-100'
                  clientNom={res.client.nom}
                  clientPrenom={res.client.prenom}
                  chambreNumero={res.chambre.numero}
                  chambreType={res.chambre.type}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disponibilité des chambres</CardTitle>
            <CardDescription>Statut actuel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ChambreParStatus status={ChambreStatus.DISPONIBLE} bgColor='bg-green-500' />
              <ChambreParStatus status={ChambreStatus.OCCUPEE} bgColor='bg-red-500' />
              <ChambreParStatus status={ChambreStatus.RESERVEE} bgColor='bg-amber-500' />
              <ChambreParStatus status={ChambreStatus.MAINTENANCE} bgColor='bg-gray-500' />
            </div>
          </CardContent>
        </Card>
      </div>
    </div >
  );
};

export default DashboardPage;
