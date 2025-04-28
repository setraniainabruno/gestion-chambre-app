
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { stats } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BedDouble, CalendarClock, UserCheck, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const COLORS = ['#3b82f6', '#14b8a6', '#f59e0b', '#ef4444'];

const occupancyData = [
  { name: 'Jan', value: 65 },
  { name: 'Fév', value: 70 },
  { name: 'Mar', value: 82 },
  { name: 'Avr', value: 74 },
  { name: 'Mai', value: 68 },
  { name: 'Jun', value: 85 },
];

const roomTypeData = [
  { name: 'Simple', value: 25 },
  { name: 'Double', value: 40 },
  { name: 'Suite', value: 20 },
  { name: 'Familiale', value: 15 },
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'occupation</CardTitle>
            <BedDouble className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tauxOccupation}%</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-4 w-4 mr-1 text-emerald-500" />
              <span className="text-emerald-500 font-medium">+2.5%</span> depuis le mois dernier
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.revenuTotal} €</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-4 w-4 mr-1 text-emerald-500" />
              <span className="text-emerald-500 font-medium">+12%</span> depuis le mois dernier
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.nombreReservations}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowDownRight className="h-4 w-4 mr-1 text-red-500" />
              <span className="text-red-500 font-medium">-3%</span> depuis le mois dernier
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activité aujourd'hui</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Arrivées</p>
                <p className="text-xl font-bold">{stats.arriveesAujourdhui}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Départs</p>
                <p className="text-xl font-bold">{stats.departsAujourdhui}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Réservations</p>
                <p className="text-xl font-bold">{stats.reservationsAujourdhui}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Occupation mensuelle</CardTitle>
            <CardDescription>Taux d'occupation des six derniers mois</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData}>
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Occupation']} />
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
              <div className="flex items-center">
                <div className="w-9 h-9 rounded bg-blue-100 flex items-center justify-center mr-3">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Dubois Jean</p>
                  <p className="text-xs text-muted-foreground">Chambre 102 - 14:00</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-9 h-9 rounded bg-blue-100 flex items-center justify-center mr-3">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Martin Sophie</p>
                  <p className="text-xs text-muted-foreground">Chambre 301 - 15:30</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-9 h-9 rounded bg-blue-100 flex items-center justify-center mr-3">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Garcia Marie</p>
                  <p className="text-xs text-muted-foreground">Chambre 205 - 16:00</p>
                </div>
              </div>
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
              <div className="flex items-center">
                <div className="w-9 h-9 rounded bg-amber-100 flex items-center justify-center mr-3">
                  <UserCheck className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Robert Thomas</p>
                  <p className="text-xs text-muted-foreground">Chambre 104 - 11:00</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-9 h-9 rounded bg-amber-100 flex items-center justify-center mr-3">
                  <UserCheck className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Petit Michel</p>
                  <p className="text-xs text-muted-foreground">Chambre 302 - 10:00</p>
                </div>
              </div>
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
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Disponibles</span>
                </div>
                <span className="font-medium">{stats.chambresDisponibles}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <span>Occupées</span>
                </div>
                <span className="font-medium">{stats.chambresOccupees}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                  <span>Réservées</span>
                </div>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
                  <span>Maintenance</span>
                </div>
                <span className="font-medium">3</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
