
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { rooms, reservations } from '@/data/mockData';
import { ReservationStatus } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { CalendarIcon, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const occupancyData = [
  { name: 'Jan', value: 65 },
  { name: 'Fév', value: 70 },
  { name: 'Mar', value: 82 },
  { name: 'Avr', value: 74 },
  { name: 'Mai', value: 68 },
  { name: 'Jun', value: 85 },
  { name: 'Juil', value: 92 },
  { name: 'Août', value: 95 },
  { name: 'Sept', value: 80 },
  { name: 'Oct', value: 72 },
  { name: 'Nov', value: 68 },
  { name: 'Déc', value: 75 },
];

const revenueData = [
  { name: 'Jan', value: 25000 },
  { name: 'Fév', value: 27500 },
  { name: 'Mar', value: 32000 },
  { name: 'Avr', value: 30000 },
  { name: 'Mai', value: 28000 },
  { name: 'Jun', value: 33000 },
  { name: 'Juil', value: 38000 },
  { name: 'Août', value: 40000 },
  { name: 'Sept', value: 34000 },
  { name: 'Oct', value: 29000 },
  { name: 'Nov', value: 26000 },
  { name: 'Déc', value: 31000 },
];

const roomTypeData = [
  { name: 'Simple', value: 25 },
  { name: 'Double', value: 40 },
  { name: 'Suite', value: 20 },
  { name: 'Familiale', value: 15 },
  { name: 'Deluxe', value: 10 },
];

const reservationStatusData = [
  { name: 'Confirmées', value: 65 },
  { name: 'En attente', value: 15 },
  { name: 'Annulées', value: 5 },
  { name: 'Terminées', value: 15 },
];

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('year');
  const [selectedReport, setSelectedReport] = useState('occupation');
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date }>({
    from: new Date(),
    to: new Date(),
  });
  
  const periods = [
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' },
    { value: 'custom', label: 'Personnalisé' },
  ];
  
  const reports = [
    { value: 'occupation', label: 'Taux d\'occupation' },
    { value: 'revenue', label: 'Revenus' },
    { value: 'roomTypes', label: 'Types de chambres' },
    { value: 'reservationStatus', label: 'Statuts des réservations' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Rapports et statistiques</h1>
      </div>
      
      <Tabs defaultValue="graphs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="graphs">Graphiques</TabsTrigger>
        </TabsList>
        
        <TabsContent value="graphs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap justify-between items-center mb-4">
                <CardTitle>Analyse des données</CardTitle>
                <div className="flex space-x-4">
                  <div className="w-[180px]">
                    <Select value={selectedReport} onValueChange={setSelectedReport}>
                      <SelectTrigger>
                        <SelectValue placeholder="Type de rapport" />
                      </SelectTrigger>
                      <SelectContent>
                        {reports.map(report => (
                          <SelectItem key={report.value} value={report.value}>
                            {report.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-[180px]">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Période" />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map(period => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedPeriod === 'custom' && (
                    <div className="flex space-x-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "justify-start text-left font-normal",
                              !dateRange.from && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange.from ? (
                              dateRange.to ? (
                                <>
                                  {format(dateRange.from, "P", { locale: fr })} -{" "}
                                  {format(dateRange.to, "P", { locale: fr })}
                                </>
                              ) : (
                                format(dateRange.from, "P", { locale: fr })
                              )
                            ) : (
                              <span>Sélectionner une période</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange as any}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <Button variant="secondary">Appliquer</Button>
                    </div>
                  )}
                </div>
              </div>
              <CardDescription>
                {selectedReport === 'occupation' && "Taux d'occupation des chambres"}
                {selectedReport === 'revenue' && "Evolution des revenus"}
                {selectedReport === 'roomTypes' && "Répartition par type de chambre"}
                {selectedReport === 'reservationStatus' && "Répartition par statut de réservation"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] pt-0">
              <ResponsiveContainer width="100%" height="100%">
                {selectedReport === 'occupation' ? (
                  <LineChart
                    data={occupancyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip formatter={(value) => [`${value}%`, "Occupation"]} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                ) : selectedReport === 'revenue' ? (
                  <BarChart
                    data={revenueData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${value} €`} />
                    <Tooltip formatter={(value) => [`${value} €`, "Revenu"]} />
                    <Bar dataKey="value" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={selectedReport === 'roomTypes' ? roomTypeData : reservationStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {(selectedReport === 'roomTypes' ? roomTypeData : reservationStatusData).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}`, ""]} />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Réservations par mois</CardTitle>
                <CardDescription>
                  Nombre total de réservations par mois
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={occupancyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Taux d'annulation</CardTitle>
                <CardDescription>
                  Pourcentage des réservations annulées par rapport au total
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Confirmées', value: 85 },
                        { name: 'Annulées', value: 15 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
