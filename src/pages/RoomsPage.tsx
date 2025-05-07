
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Chambre, ChambreType, ChambreStatus } from '@/types';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Search
} from 'lucide-react';
import api from '@/lib/api';
import { ControlleChamps } from '@/utils/controlleChamp';

const RoomsPage = () => {
  const [rooms, setRooms] = useState<Chambre[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roomToEdit, setRoomToEdit] = useState<Chambre | null>(null);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [chambreNum, setChambreNum] = useState<string>('');

  const { toast } = useToast();
  const ctrl = new ControlleChamps();


  const [formData, setFormData] = useState<Partial<Chambre>>({
    numero: "",
    type: ChambreType.SIMPLE,
    etage: 1,
    prix: 0,
    capacite: 1,
    statut: ChambreStatus.DISPONIBLE,
    description: '',
  });

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getAllChambres = async () => {
    await api.get('/chambres')
      .then((res) => {
        const chambres = res.data;
        let num = -Infinity;
        chambres.forEach((e: Chambre) => {
          if (parseInt(e.numero) > num) num = parseInt(e.numero);
        });
        setChambreNum((++num).toString());
        setRooms(chambres);
      })
      .catch((error) => console.error(error))
  };

  useEffect(() => {
    getAllChambres();
  }, []);




  const handleAddRoom = async () => {
    try {
      const chambre: Chambre = {
        id: `room-${Date.now()}`,
        numero: formData.numero,
        type: formData.type || ChambreType.SIMPLE,
        etage: formData.etage || 1,
        prix: formData.prix || 0,
        capacite: formData.capacite || 1,
        statut: formData.statut || ChambreStatus.DISPONIBLE,
        description: formData.description || ''
      };
      console.log(chambre)
      if (chambre.numero == "" || chambre.prix == 0) return;


      const res = await api.post('/chambres', chambre,
        {
          headers: { 'Content-type': 'application/json' }
        }
      )
      if (res) {
        getAllChambres();
        resetForm();
        setIsAddingRoom(false);
        toast({
          title: 'Chambre ajoutée',
          description: `La chambre ${chambre.numero} a été ajoutée avec succès.`,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      numero: '',
      type: ChambreType.SIMPLE,
      etage: 1,
      prix: 0,
      capacite: 1,
      statut: ChambreStatus.DISPONIBLE,
      description: '',
    });
  };

  const handleEditRoom = (room: Chambre) => {
    setRoomToEdit(room);
    setFormData({
      numero: room.numero,
      type: room.type,
      etage: room.etage,
      prix: room.prix,
      capacite: room.capacite,
      statut: room.statut,
      description: room.description || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (!roomToEdit) return;


      const updatedRoom = {
        numero: formData.numero || roomToEdit.numero,
        type: formData.type || roomToEdit.type,
        etage: formData.etage !== undefined ? formData.etage : roomToEdit.etage,
        prix: formData.prix !== undefined ? formData.prix : roomToEdit.prix,
        capacite: formData.capacite !== undefined ? formData.capacite : roomToEdit.capacite,
        statut: formData.statut || roomToEdit.statut,
        description: formData.description,
      };
      if (updatedRoom.prix == 0) return;

      const res = await api.put(`/chambres/${roomToEdit.id}`,
        updatedRoom,
        {
          headers: { "Content-type": "application/json" }
        }
      )
      if (res) {
        getAllChambres();
        setRoomToEdit(null);
        setEditDialogOpen(false);
        toast({
          title: 'Chambre modifiée',
          description: `La chambre ${formData.numero} a été modifiée avec succès.`,
        });
      }

    } catch (error) {
      console.error(error)
    }
  };

  const handleDeleteConfirmation = async (roomId: string) => {
    // Vérifier si la chambre est ocuppé ou reservé
    await api.get(`/chambres/${roomId}`)
      .then((res) => {
        const chambre = res.data;
        if (chambre.statut == ChambreStatus.OCCUPEE || chambre.statut == ChambreStatus.RESERVEE) {
          toast({
            title: 'Suppression impossible',
            description: `Chambre ${chambre.statut.toLowerCase()}`,
            variant: 'destructive',
          });
          setRoomToDelete('');
          setShowDeleteConfirm(false);
        } else {
          setRoomToDelete(roomId);
          setShowDeleteConfirm(true);
        }
      })
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;

    try {
      const res = await api.delete(`/chambres/${roomToDelete}`);
      if (res) {
        getAllChambres();
        setRoomToDelete(null);
        setShowDeleteConfirm(false);
        toast({
          title: 'Chambre supprimée',
          description: 'La chambre a été supprimée avec succès.',
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: ChambreStatus) => {
    const statusMap = {
      [ChambreStatus.DISPONIBLE]: { color: 'bg-green-100 text-green-800', label: 'Disponible' },
      [ChambreStatus.OCCUPEE]: { color: 'bg-red-100 text-red-800', label: 'Occupée' },
      [ChambreStatus.MAINTENANCE]: { color: 'bg-gray-100 text-gray-800', label: 'Maintenance' },
      [ChambreStatus.RESERVEE]: { color: 'bg-amber-100 text-amber-800', label: 'Réservée' },
    };

    return (
      <Badge variant="outline" className={`${statusMap[status].color}`}>
        {statusMap[status].label}
      </Badge>
    );
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des chambres</h1>
        <Dialog open={isAddingRoom} onOpenChange={setIsAddingRoom}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une chambre
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle chambre</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer une nouvelle chambre.
              </DialogDescription>
            </DialogHeader>
            <form className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero">Numéro</Label>
                  <Input
                    id="numero"
                    placeholder="Numéro.."
                    value={chambreNum}
                    onFocus={e => {
                      handleFormChange('numero', ctrl.nombre(e.target.value));
                      setChambreNum(ctrl.nombre(e.target.value));
                    }}
                    onChange={e => {
                      handleFormChange('numero', ctrl.nombre(e.target.value));
                      setChambreNum(ctrl.nombre(e.target.value));
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="etage">Étage</Label>
                  <Input
                    id="etage"
                    type="number"
                    value={formData.etage}
                    onChange={e => handleFormChange('etage', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={value => handleFormChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ChambreType).map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      {Object.values(ChambreStatus).map(status => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prix">Prix par nuit (Ar)</Label>
                  <Input
                    id="prix"
                    value={formData.prix}
                    onChange={e => handleFormChange('prix', ctrl.nombre(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacite">Capacité</Label>
                  <Input
                    id="capacite"
                    type="number"
                    value={formData.capacite}
                    onChange={e => handleFormChange('capacite', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Description de la chambre"
                  value={formData.description}
                  onChange={e => handleFormChange('description', e.target.value)}
                />
              </div>
            </form>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={handleAddRoom}>Ajouter</Button>
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
                  placeholder="Rechercher une chambre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(ctrl.lettreNombre(e.target.value))}
                  className="pl-9 w-[300px]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Étage</TableHead>
                  <TableHead>Prix/nuit</TableHead>
                  <TableHead>Capacité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.numero}</TableCell>
                    <TableCell>{room.type}</TableCell>
                    <TableCell>{room.etage}</TableCell>
                    <TableCell>{room.prix} Ar</TableCell>
                    <TableCell>{room.capacite}</TableCell>
                    <TableCell>{getStatusBadge(room.statut)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  handleEditRoom(room);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[625px]">
                              <DialogHeader>
                                <DialogTitle>Modifier la chambre {roomToEdit?.numero}</DialogTitle>
                                <DialogDescription>
                                  Modifiez les informations de la chambre.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="numero">Numéro</Label>
                                    <Input
                                      id="numero"
                                      placeholder="Numéro..."
                                      value={formData.numero}
                                      onChange={e => handleFormChange('numero', ctrl.nombre(e.target.value))}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="etage">Étage</Label>
                                    <Input
                                      id="etage"
                                      type="number"
                                      value={formData.etage}
                                      onChange={e => handleFormChange('etage', parseInt(e.target.value))}
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                      value={formData.type}
                                      onValueChange={value => handleFormChange('type', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {Object.values(ChambreType).map(type => (
                                          <SelectItem key={type} value={type}>
                                            {type}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
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
                                        {Object.values(ChambreStatus).map(status => (
                                          <SelectItem key={status} value={status}>
                                            {status}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="prix">Prix par nuit (Ar)</Label>
                                    <Input
                                      id="prix"
                                      value={formData.prix}
                                      onChange={e => handleFormChange('prix', ctrl.nombre(e.target.value))}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="capacite">Capacité</Label>
                                    <Input
                                      id="capacite"
                                      type="number"
                                      value={formData.capacite}
                                      onChange={e => handleFormChange('capacite', parseInt(e.target.value))}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="description">Description</Label>
                                  <Input
                                    id="description"
                                    placeholder="Description de la chambre"
                                    value={formData.description}
                                    onChange={e => handleFormChange('description', e.target.value)}
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
                          <DropdownMenuItem onSelect={() => handleDeleteConfirmation(room.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
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
              Êtes-vous sûr de vouloir supprimer cette chambre ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteRoom}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomsPage;
