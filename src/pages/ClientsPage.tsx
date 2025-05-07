
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Client } from '@/types';
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
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  UserPlus
} from 'lucide-react';
import api from '@/lib/api';
import ReservationParClient from '../components/ReservationParClient';
import { ControlleChamps } from '@/utils/controlleChamp';


const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [isUpdatingClient, setIsUpdatingClient] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const ctrl = new ControlleChamps();

  // État pour le formulaire
  const [formData, setFormData] = useState<Partial<Client>>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    numeroPieceIdentite: '',
    typePieceIdentite: '',
  });

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getAllClients = async () => {
    try {
      const res = await api.get('/clients');
      if (res) {
        setClients(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getAllClients();
  }, []);

  const handleAddClient = async () => {
    try {
      const client: Client = {
        id: `client-${Date.now()}`,
        nom: formData.nom || '',
        prenom: formData.prenom || '',
        email: formData.email || '',
        telephone: formData.telephone || '',
        adresse: formData.adresse,
        numeroPieceIdentite: formData.numeroPieceIdentite,
        typePieceIdentite: formData.typePieceIdentite,
        dateCreation: new Date(),
      };

      const res = await api.post('/clients', client,
        {
          headers: { "Content-Type": "application/json" }
        }
      )
      if (res) {
        getAllClients();
        resetForm();
        setIsAddingClient(false);
        toast({
          title: 'Client ajouté',
          description: `${client.nom} ${client.prenom} a été ajouté avec succès.`,
        });
      }

    } catch (error) {
      console.log(error);
    }
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setFormData({
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      telephone: client.telephone,
      adresse: client.adresse,
      numeroPieceIdentite: client.numeroPieceIdentite,
      typePieceIdentite: client.typePieceIdentite,
    });
    setIsUpdatingClient(true);
  };

  const handleSaveEdit = async () => {
    if (!clientToEdit) return;

    try {
      const updatedClients = {
        nom: formData.nom || clientToEdit.nom,
        prenom: formData.prenom || clientToEdit.prenom,
        email: formData.email || clientToEdit.email,
        telephone: formData.telephone || clientToEdit.telephone,
        adresse: formData.adresse,
        numeroPieceIdentite: formData.numeroPieceIdentite,
        typePieceIdentite: formData.typePieceIdentite,
      };

      if (!clientToEdit.id) {
        console.log('Id non trouvé');
        return
      }
      const res = await api.put(`/clients/${clientToEdit.id}`, updatedClients,
        {
          headers: { "Content-Type": "application/json" }
        }
      );
      if (res) {
        getAllClients();
        setClientToEdit(null);
        setIsUpdatingClient(false);
        resetForm();
        toast({
          title: 'Client modifié',
          description: `${formData.prenom} ${formData.nom} a été modifié avec succès.`,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      numeroPieceIdentite: '',
      typePieceIdentite: '',
    });
  };



  const handleDeleteConfirmation = async (clientId: string) => {
    // Vérifier si le client a des réservations
    const nombre_res = await api.get(`/reservations/nombre-client/${clientId}`);

    if (nombre_res.data > 0) {
      toast({
        title: 'Suppression impossible',
        description: 'Ce client a des réservations associées. Veuillez d\'abord supprimer ces réservations.',
        variant: 'destructive',
      });
      return;
    }

    setClientToDelete(clientId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;

    try {
      const res = await api.delete(`/clients/${clientToDelete}`);
      if (res) {
        getAllClients();
        setShowDeleteConfirm(false);
        toast({
          title: 'Client supprimé',
          description: 'Le client a été supprimé avec succès.',
        });
      }

    } catch (error) {
      console.error(error);
    }
  };

  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Gestion des clients</h1>
        <Dialog open={isAddingClient} onOpenChange={setIsAddingClient} >
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter un client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau client</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer une nouvelle fiche client.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    placeholder="Nom"
                    value={formData.nom}
                    onChange={e => handleFormChange('nom', ctrl.lettre(e.target.value.toLocaleUpperCase()))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    placeholder="Prénom"
                    value={formData.prenom}
                    onChange={e => handleFormChange('prenom', ctrl.lettre(e.target.value))}

                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre-email@gmail.com"
                    value={formData.email}
                    onChange={e => handleFormChange('email', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input
                    id="telephone"
                    placeholder="Téléphone"
                    value={formData.telephone}
                    onChange={e => handleFormChange('telephone', ctrl.taille(ctrl.nombre(e.target.value), 10))}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  placeholder="Adresse complète"
                  value={formData.adresse}
                  onChange={e => handleFormChange('adresse', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pieceIdentiteType">Type de pièce d'identité</Label>
                  <Select
                    value={formData.typePieceIdentite}
                    onValueChange={(value) => {
                      handleFormChange('typePieceIdentite', value)
                      handleFormChange('numeroPieceIdentite', '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Carte d'identité">Carte d'identité</SelectItem>
                      <SelectItem value="Passeport">Passeport</SelectItem>
                      <SelectItem value="Permis de conduire">Permis de conduire</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numeroPieceIdentite">Numéro de pièce d'identité</Label>
                  <Input
                    id="numeroPieceIdentite"
                    placeholder="Numéro de pièce d'identité"
                    value={formData.numeroPieceIdentite}
                    onChange={e => handleFormChange('numeroPieceIdentite',
                      (formData.typePieceIdentite == "Carte d'identité") ? ctrl.taille(ctrl.nombre(e.target.value), 12) : e.target.value
                    )}

                  />
                </div>
              </div>


            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={handleAddClient}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(ctrl.lettreNombre(e.target.value))}
                className="pl-9 w-[300px]"
              />
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Réservations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="font-medium">{client.nom} {client.prenom}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.dateCreation && `Client depuis ${format(client.dateCreation, 'MM/yyyy')}`}
                      </div>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.telephone}</TableCell>
                    <TableCell>{client.adresse || '-'}</TableCell>
                    <ReservationParClient clientId={client.id} />

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Dialog open={isUpdatingClient} onOpenChange={setIsUpdatingClient}>
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault();
                                  handleEditClient(client);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[625px]">
                              <DialogHeader>
                                <DialogTitle>Modifier le client</DialogTitle>
                                <DialogDescription>
                                  Modifiez les informations du client.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="nom">Nom</Label>
                                      <Input
                                        id="nom"
                                        placeholder="Nom"
                                        value={formData.nom}
                                        onChange={e => handleFormChange('nom', ctrl.lettre(e.target.value.toLocaleUpperCase()))}
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="prenom">Prénom</Label>
                                      <Input
                                        id="prenom"
                                        placeholder="Prénom"
                                        value={formData.prenom}
                                        onChange={e => handleFormChange('prenom', ctrl.lettre(e.target.value))}
                                        required
                                      />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="email">Email</Label>
                                      <Input
                                        id="email"
                                        type="email"
                                        placeholder="votre-email@gmail.com"
                                        value={formData.email}
                                        onChange={e => handleFormChange('email', e.target.value)}
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="telephone">Téléphone</Label>
                                      <Input
                                        id="telephone"
                                        placeholder="Téléphone"
                                        value={formData.telephone}
                                        onChange={e => handleFormChange('telephone', ctrl.taille(ctrl.nombre(e.target.value), 10))}
                                        required
                                      />
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="adresse">Adresse</Label>
                                    <Input
                                      id="adresse"
                                      placeholder="Adresse complète"
                                      value={formData.adresse}
                                      onChange={e => handleFormChange('adresse', e.target.value)}
                                    />
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="pieceIdentiteType">Type de pièce d'identité</Label>
                                      <Select
                                        value={formData.typePieceIdentite}
                                        onValueChange={(value) => {
                                          handleFormChange('typePieceIdentite', value);
                                          handleFormChange('numeroPieceIdentite', '');
                                        }}
                                      >
                                        <SelectTrigger>
                                          <SelectValue placeholder="Sélectionner un type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="Carte d'identité">Carte d'identité</SelectItem>
                                          <SelectItem value="Passeport">Passeport</SelectItem>
                                          <SelectItem value="Permis de conduire">Permis de conduire</SelectItem>
                                          <SelectItem value="Autre">Autre</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="numeroPieceIdentite">Numéro de pièce d'identité</Label>
                                      <Input
                                        id="numeroPieceIdentite"
                                        placeholder="Numéro de pièce d'identité"
                                        value={formData.numeroPieceIdentite}
                                        onChange={e => handleFormChange('numeroPieceIdentite',
                                          (formData.typePieceIdentite == "Carte d'identité") ? ctrl.taille(ctrl.nombre(e.target.value), 12) : e.target.value
                                        )}
                                      />
                                    </div>
                                  </div>


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
                          <DropdownMenuItem
                            onSelect={() => handleDeleteConfirmation(client.id)}
                          >
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
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteClient}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientsPage;
