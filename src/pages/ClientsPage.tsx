
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { clients as initialClients, reservations } from '@/data/mockData';
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
import {
  CalendarIcon,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  // État pour le formulaire
  const [formData, setFormData] = useState<Partial<Client>>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    dateNaissance: undefined,
    numeroPieceIdentite: '',
    typePieceIdentite: '',
  });

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddClient = () => {
    const newClient: Client = {
      id: `client-${Date.now()}`,
      nom: formData.nom || '',
      prenom: formData.prenom || '',
      email: formData.email || '',
      telephone: formData.telephone || '',
      adresse: formData.adresse,
      dateNaissance: formData.dateNaissance,
      numeroPieceIdentite: formData.numeroPieceIdentite,
      typePieceIdentite: formData.typePieceIdentite,
      dateCreation: new Date(),
    };

    setClients([...clients, newClient]);
    resetForm();
    setIsAddingClient(false);

    toast({
      title: 'Client ajouté',
      description: `${newClient.prenom} ${newClient.nom} a été ajouté avec succès.`,
    });
  };

  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setFormData({
      nom: client.nom,
      prenom: client.prenom,
      email: client.email,
      telephone: client.telephone,
      adresse: client.adresse,
      dateNaissance: client.dateNaissance,
      numeroPieceIdentite: client.numeroPieceIdentite,
      typePieceIdentite: client.typePieceIdentite,
    });
  };

  const handleSaveEdit = () => {
    if (!clientToEdit) return;

    const updatedClients = clients.map(client =>
      client.id === clientToEdit.id
        ? {
          ...clientToEdit,
          nom: formData.nom || clientToEdit.nom,
          prenom: formData.prenom || clientToEdit.prenom,
          email: formData.email || clientToEdit.email,
          telephone: formData.telephone || clientToEdit.telephone,
          adresse: formData.adresse,
          dateNaissance: formData.dateNaissance,
          numeroPieceIdentite: formData.numeroPieceIdentite,
          typePieceIdentite: formData.typePieceIdentite,
        }
        : client
    );

    setClients(updatedClients);
    setClientToEdit(null);
    resetForm();

    toast({
      title: 'Client modifié',
      description: `${formData.prenom} ${formData.nom} a été modifié avec succès.`,
    });
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      adresse: '',
      dateNaissance: undefined,
      numeroPieceIdentite: '',
      typePieceIdentite: '',
    });
  };

  const handleDeleteConfirmation = (clientId: string) => {
    // Vérifier si le client a des réservations
    const hasReservations = reservations.some(reservation => reservation.clientId === clientId);

    if (hasReservations) {
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

  const handleDeleteClient = () => {
    if (!clientToDelete) return;

    const updatedClients = clients.filter(client => client.id !== clientToDelete);
    setClients(updatedClients);
    setClientToDelete(null);
    setShowDeleteConfirm(false);

    toast({
      title: 'Client supprimé',
      description: 'Le client a été supprimé avec succès.',
    });
  };

  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.telephone.includes(searchTerm)
  );

  // Fonction pour obtenir le nombre de réservations par client
  const getReservationCountForClient = (clientId: string): number => {
    return reservations.filter(reservation => reservation.clientId === clientId).length;
  };

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
                    onChange={e => handleFormChange('nom', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    placeholder="Prénom"
                    value={formData.prenom}
                    onChange={e => handleFormChange('prenom', e.target.value)}
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
                    onChange={e => handleFormChange('telephone', e.target.value)}
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
                    onValueChange={value => handleFormChange('typePieceIdentite', value)}
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
                    onChange={e => handleFormChange('numeroPieceIdentite', e.target.value)}
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                      <div className="font-medium">{client.prenom} {client.nom}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.dateCreation && `Client depuis ${format(client.dateCreation, 'MM/yyyy')}`}
                      </div>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.telephone}</TableCell>
                    <TableCell>{client.adresse || '-'}</TableCell>
                    <TableCell>{getReservationCountForClient(client.id)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Dialog>
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
                                        onChange={e => handleFormChange('nom', e.target.value)}
                                        required
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="prenom">Prénom</Label>
                                      <Input
                                        id="prenom"
                                        placeholder="Prénom"
                                        value={formData.prenom}
                                        onChange={e => handleFormChange('prenom', e.target.value)}
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
                                        onChange={e => handleFormChange('telephone', e.target.value)}
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
                                        onValueChange={value => handleFormChange('typePieceIdentite', value)}
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
                                        onChange={e => handleFormChange('numeroPieceIdentite', e.target.value)}
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
