
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { isToday } from 'date-fns';
import { Chambre, ChambreStatus, Client, Reservation, ReservationStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  CalendarIcon,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { ControlleChamps } from '@/utils/controlleChamp';


const ReservationsPage = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [rooms, setRooms] = useState<Chambre[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('toutes');
  const [isAddingReservation, setIsAddingReservation] = useState(false);
  const [reservationToEdit, setReservationToEdit] = useState<Reservation | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const ctrl = new ControlleChamps();

  // État pour le formulaire
  const [formData, setFormData] = useState<{
    chambreId: string;
    clientId: string;
    dateArrivee: Date;
    dateDepart: Date;
    nombrePersonnes: number;
    statut: ReservationStatus;
    prixTotal: number;
    commentaires?: string;
  }>({
    chambreId: '',
    clientId: '',
    dateArrivee: new Date(),
    dateDepart: new Date(),
    nombrePersonnes: 1,
    statut: ReservationStatus.EN_ATTENTE,
    prixTotal: 0,
    commentaires: '',
  });


  const minDate = new Date(formData.dateArrivee);
  const maxDate = new Date(formData.dateDepart);

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const room = rooms.find(r => r.id === formData.chambreId);
    if (room) {
      const dateArrivee: any = new Date(formData.dateArrivee);
      const dateDepart: any = new Date(formData.dateDepart);
      const millisecondsPerDay = 24 * 60 * 60 * 1000;
      if (dateArrivee && dateDepart) {
        const nombreNuits = Math.ceil((dateDepart - dateArrivee) / millisecondsPerDay);
        const nouveauPrix = room.prix * nombreNuits;
        setFormData(prev => ({ ...prev, prixTotal: nouveauPrix }));
      }
    }
  }, [formData.dateArrivee, formData.dateDepart, formData.chambreId])


  const changeStatusReservation = async (reservationId: string, status: ReservationStatus) => {
    await api.put(`/reservations/${reservationId}/statut`, { status },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: { statut: status }
      }
    )
  };
  const changeStatusChambre = async (chambreId: string, status: ChambreStatus) => {
    await api.put(`/chambres/${chambreId}/statut`, { status },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: { statut: status }
      }
    )
  };

  const getAllReservations = async () => {
    await api.get('/reservations')
      .then(async (res) => {
        res.data.forEach(async (e: Reservation) => {

          const dateArrivee = new Date(format(e.dateArrivee, 'MM/dd/yyy'));
          const dateDepart = new Date(format(e.dateDepart, 'MM/dd/yyy'));
          const aujourdHui = new Date(format(new Date(), 'MM/dd/yyyy'));
          const reservationId = e.id;
          const chambreId = e.chambre.id;


          if (e.statut == ReservationStatus.EN_ATTENTE) {
            if (aujourdHui >= dateArrivee) {
              changeStatusReservation(reservationId, ReservationStatus.ANNULEE);
            }
          } else if (e.statut === ReservationStatus.CONFIRMEE) {

            if ((aujourdHui >= dateArrivee && aujourdHui < dateDepart)) {
              changeStatusChambre(chambreId, ChambreStatus.OCCUPEE);

            } else if (isToday(dateDepart)) {
              changeStatusReservation(reservationId, ReservationStatus.TERMINEE);
            }
          }
        });
        await api.get('/reservations')
          .then((res) => {
            setReservations(res.data);
            getAllChambres();
          })
      })
      .catch((error) => console.error(error))
  };

  const getAllClients = async () => {

    await api.get('/clients')
      .then((res) => setClients(res.data))
      .catch((error) => console.error(error))
  };
  const getAllChambres = async () => {
    await api.get('/chambres')
      .then((res) => setRooms(res.data))
      .catch((error) => console.error(error))
  };

  useEffect(() => {
    getAllClients();
    getAllReservations();
  }, []);

  const resetForm = () => {
    setFormData({
      chambreId: '',
      clientId: '',
      dateArrivee: new Date(),
      dateDepart: new Date(),
      nombrePersonnes: 1,
      statut: ReservationStatus.EN_ATTENTE,
      prixTotal: 0,
      commentaires: '',
    });
  };

  const handleAddReservation = async () => {
    const reservation: any = {
      id: `res-${Date.now()}`,
      dateArrivee: formData.dateArrivee,
      dateDepart: formData.dateDepart,
      nombrePersonnes: formData.nombrePersonnes,
      statut: formData.statut,
      prixTotal: formData.prixTotal,
      commentaires: formData.commentaires,
      dateCreation: new Date(),
    };

    if (reservation.prixTotal == 0) return;

    await api.post('/reservations', reservation,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          clientId: formData.clientId,
          chambreId: formData.chambreId
        }
      })
      .then((res) => {
        getAllReservations();
        resetForm();
        setIsAddingReservation(false);
        toast({
          title: 'Réservation ajoutée',
          description: 'La réservation a été ajoutée avec succès.',
        });
      })
      .catch((error) => console.error(error))
  };


  const handleEditReservation = (reservation: Reservation) => {
    setReservationToEdit(reservation);
    setFormData({
      chambreId: reservation.chambre.id,
      clientId: reservation.client.id,
      dateArrivee: reservation.dateArrivee,
      dateDepart: reservation.dateDepart,
      nombrePersonnes: reservation.nombrePersonnes,
      statut: reservation.statut,
      prixTotal: reservation.prixTotal,
      commentaires: reservation.commentaires,
    });
    setIsEditingReservation(true);
  };

  const handleSaveEdit = async () => {
    if (!reservationToEdit) return;


    const updatedReservations = {
      dateArrivee: formData.dateArrivee,
      dateDepart: formData.dateDepart,
      nombrePersonnes: formData.nombrePersonnes,
      statut: formData.statut,
      prixTotal: formData.prixTotal,
      commentaires: formData.commentaires,
    }
    if (updatedReservations.prixTotal == 0) return;


    await api.put(`/reservations/${reservationToEdit.id}`, updatedReservations,
      {
        headers: { "Content-Type": "application/json" }
      }
    )
      .then((res) => {
        getAllReservations();
        resetForm();
        setIsEditingReservation(false);
        setReservationToEdit(null);
        toast({
          title: 'Réservation modifiée',
          description: 'La réservation a été modifiée avec succès.',
        });

      })
      .catch((error) => console.error(error))
  };

  const handleDeleteConfirmation = (reservationId: string) => {
    setReservationToDelete(reservationId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteReservation = async () => {
    if (!reservationToDelete) return;
    await api.delete(`/reservations/${reservationToDelete}`)
      .then(() => {
        getAllChambres();
        getAllReservations();
        setReservationToDelete(null);
        setShowDeleteConfirm(false);
        toast({
          title: 'Réservation supprimée',
          description: 'La réservation a été supprimée avec succès.',
        });
      })
      .catch((error) => console.error(error))
  };

  // Filtrage des réservations
  const filteredReservations = reservations.filter(reservation => {
    // Filtre par terme de recherche
    const room = rooms.find(r => r.id === reservation.chambre.id);
    const client = clients.find(c => c.id === reservation.client.id);
    const searchCondition =
      room?.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${client?.prenom} ${client?.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      format(reservation.dateArrivee, 'dd/MM/yyyy').includes(searchTerm);

    // Filtre par statut
    const statusCondition = selectedStatus === 'toutes' || reservation.statut === selectedStatus;

    return searchCondition && statusCondition;
  });

  const getStatusBadge = (status: ReservationStatus) => {
    const statusMap = {
      [ReservationStatus.CONFIRMEE]: { color: 'bg-green-100 text-green-800', label: 'Confirmée' },
      [ReservationStatus.EN_ATTENTE]: { color: 'bg-amber-100 text-amber-800', label: 'En attente' },
      [ReservationStatus.ANNULEE]: { color: 'bg-red-100 text-red-800', label: 'Annulée' },
      [ReservationStatus.TERMINEE]: { color: 'bg-blue-100 text-blue-800', label: 'Terminée' },
    };

    return (
      <Badge variant="outline" className={`${statusMap[status].color}`}>
        {statusMap[status].label}
      </Badge>
    );
  };

  const getRoomInfoById = (roomId: string): Chambre | undefined => {
    return rooms.find(room => room.id === roomId);
  };


  const [isEditingReservation, setIsEditingReservation] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des réservations</h1>
        <Dialog open={isAddingReservation} onOpenChange={setIsAddingReservation}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une réservation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle réservation</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer une nouvelle réservation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={value => handleFormChange('clientId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nom} {client.prenom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chambre">Chambre</Label>
                  <Select
                    value={formData.chambreId}
                    onValueChange={value => handleFormChange('chambreId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une chambre" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.filter((r) => r.statut == ChambreStatus.DISPONIBLE).map(room => (
                        <SelectItem key={room.id} value={room.id}>
                          {room.numero} - {room.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date d'arrivée</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dateArrivee && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dateArrivee ? (
                          format(formData.dateArrivee, "PPPP", { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dateArrivee}
                        onSelect={(date) => date && handleFormChange('dateArrivee', date)}
                        toDate={maxDate}
                        initialFocus
                        className="p-3 pointer-events-auto"

                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Date de départ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.dateDepart && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dateDepart ? (
                          format(formData.dateDepart, "PPPP", { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.dateDepart}
                        onSelect={(date) => date && handleFormChange('dateDepart', date > formData.dateArrivee ? date : formData.dateArrivee)}
                        initialFocus
                        fromDate={minDate}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="personnes">Nombre de personnes</Label>
                  <Input
                    id="personnes"
                    type="number"
                    value={formData.nombrePersonnes}
                    onChange={e => handleFormChange('nombrePersonnes', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="statut">Statut</Label>
                  <Select
                    value={formData.statut}
                    onValueChange={value => handleFormChange('statut', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ReservationStatus).map(status => (
                        <SelectItem key={status} value={status}>
                          {status == "En_attente" ? "En attente" : status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="prixTotal">Prix total (Ar)</Label>
                  {formData.chambreId && (
                    <span className="text-xs text-muted-foreground">
                      {getRoomInfoById(formData.chambreId)?.prix} Ar / nuit
                    </span>
                  )}
                </div>
                <Input
                  id="prixTotal"
                  value={formData.prixTotal}
                  onChange={e => handleFormChange('prixTotal', parseInt(ctrl.nombre(e.target.value)))}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commentaires">Commentaires</Label>
                <Textarea
                  id="commentaires"
                  placeholder="Commentaires ou demandes spécifiques..."
                  value={formData.commentaires}
                  onChange={e => handleFormChange('commentaires', e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={handleAddReservation}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une réservation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(ctrl.lettreNombre(e.target.value))}
                  className="pl-9 w-[300px]"
                />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSelectedStatus('toutes')}>
                  {selectedStatus === 'toutes' && <Check className="h-4 w-4 mr-2" />}
                  Toutes
                </DropdownMenuItem>
                {Object.values(ReservationStatus).map(status => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                  >
                    {selectedStatus === status && <Check className="h-4 w-4 mr-2" />}
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Chambre</TableHead>
                  <TableHead>Date d'arrivée</TableHead>
                  <TableHead>Date de départ</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Date de réservation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map((reservation) => {
                  return (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{reservation.client.nom} {reservation.client.prenom}</div>
                          <div className="text-sm text-muted-foreground">{reservation.client.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{reservation.chambre.numero} - {reservation.chambre.type}</TableCell>
                      <TableCell>{format(reservation.dateArrivee, 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{format(reservation.dateDepart, 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{reservation.prixTotal} Ar</TableCell>
                      <TableCell>{format(reservation.dateCreation, 'dd/MM/yyyy')}</TableCell>

                      <TableCell>{getStatusBadge(reservation.statut)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Ouvrir le menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Dialog open={isEditingReservation} onOpenChange={setIsEditingReservation}>
                              <DialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => {
                                    e.preventDefault();
                                    handleEditReservation(reservation);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Modifier
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[625px]">
                                <DialogHeader>
                                  <DialogTitle>Modifier la réservation</DialogTitle>
                                  <DialogDescription>
                                    Modifiez les informations de la réservation.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="client">Client</Label>
                                      <Select
                                        value={formData.clientId}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Sélectionner un client" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {clients.map(client => (
                                            <SelectItem key={client.id} value={client.id}>
                                              {client.prenom} {client.nom}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="chambre">Chambre</Label>
                                      <Select
                                        value={formData.chambreId}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Sélectionner une chambre" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {rooms.map(room => (
                                            <SelectItem key={room.id} value={room.id}>
                                              {room.numero} - {room.type}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label>Date d'arrivée</Label>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="outline"
                                            className={cn(
                                              "w-full justify-start text-left font-normal",
                                              !formData.dateArrivee && "text-muted-foreground"
                                            )}
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.dateArrivee ? (
                                              format(formData.dateArrivee, "PPPP", { locale: fr })
                                            ) : (
                                              <span>Sélectionner une date</span>
                                            )}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                          <Calendar
                                            mode="single"
                                            selected={formData.dateArrivee}
                                            onSelect={(date) => date && handleFormChange('dateArrivee', date)}
                                            initialFocus
                                            toDate={maxDate}
                                            className="p-3 pointer-events-auto"
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                    <div className="space-y-2">
                                      <Label>Date de départ</Label>
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="outline"
                                            className={cn(
                                              "w-full justify-start text-left font-normal",
                                              !formData.dateDepart && "text-muted-foreground"
                                            )}
                                          >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formData.dateDepart ? (
                                              format(formData.dateDepart, "PPPP", { locale: fr })
                                            ) : (
                                              <span>Sélectionner une date</span>
                                            )}
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                          <Calendar
                                            mode="single"
                                            selected={formData.dateDepart}
                                            onSelect={(date) => {
                                              date && handleFormChange('dateDepart', date)
                                            }}
                                            fromDate={minDate}
                                            initialFocus
                                            className="p-3 pointer-events-auto"
                                          />
                                        </PopoverContent>
                                      </Popover>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="personnes">Nombre de personnes</Label>
                                      <Input
                                        id="personnes"
                                        type="number"
                                        value={formData.nombrePersonnes}
                                        onChange={e => handleFormChange('nombrePersonnes', parseInt(e.target.value))}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="statut">Statut</Label>
                                      <Select
                                        value={formData.statut}
                                        onValueChange={value => handleFormChange('statut', value)}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Sélectionner un statut" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {Object.values(ReservationStatus).map(status => (
                                            <SelectItem key={status} value={status}>
                                              {status == "En_attente" ? "En attente" : status}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <Label htmlFor="prixTotal">Prix total (Ar)</Label>
                                      {formData.chambreId && (
                                        <span className="text-xs text-muted-foreground">
                                          {getRoomInfoById(formData.chambreId)?.prix} Ar / nuit
                                        </span>
                                      )}
                                    </div>
                                    <Input
                                      id="prixTotal"
                                      value={formData.prixTotal}
                                      onChange={e => handleFormChange('prixTotal', parseInt(ctrl.nombre(e.target.value)))}
                                      readOnly
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="commentaires">Commentaires</Label>
                                    <Textarea
                                      id="commentaires"
                                      placeholder="Commentaires ou demandes spécifiques..."
                                      value={formData.commentaires}
                                      onChange={e => handleFormChange('commentaires', e.target.value)}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Annuler</Button>
                                  </DialogClose>
                                  <Button onClick={handleSaveEdit}>Enregistrer</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <DropdownMenuItem onSelect={() => handleDeleteConfirmation(reservation.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteReservation}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReservationsPage;
