
// Types pour la gestion des chambres
export interface Chambre {
  id: string;
  numero: string;
  type: ChambreType;
  etage: number;
  prix: number;
  capacite: number;
  statut: ChambreStatus;
  description?: string;
}

export enum ChambreType {
  SIMPLE = "Simple",
  DOUBLE = "Double",
  SUITE = "Suite",
  FAMILIALE = "Familiale",
  DELUXE = "Deluxe",
}

export enum ChambreStatus {
  DISPONIBLE = "Disponible",
  OCCUPEE = "Occupée",
  MAINTENANCE = "Maintenance",
  RESERVEE = "Réservée",
}

// Types pour la gestion des réservations
export interface Reservation {
  id: string;
  chambre: Chambre;
  client: Client;
  dateArrivee: Date;
  dateDepart: Date;
  nombrePersonnes: number;
  statut: ReservationStatus;
  prixTotal: number;
  commentaires?: string;
  dateCreation: Date;
}

export enum ReservationStatus {
  CONFIRMEE = "Confirmée",
  EN_ATTENTE = "En_attente",
  ANNULEE = "Annulée",
  TERMINEE = "Terminée",
}

// Types pour la gestion des clients
export interface Client {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  numeroPieceIdentite?: string;
  typePieceIdentite?: string;
  dateCreation: Date;
}

// Types pour les statistiques
export interface Stats {
  tauxOccupation: number;
  revenuTotal: number;
  nombreReservations: number;
  chambresDisponibles: number;
  chambresOccupees: number;
  reservationsAujourdhui: number;
  departsAujourdhui: number;
  arriveesAujourdhui: number;
}

// Type pour l'utilisateur
export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  roles: UserRole;
}

export enum UserRole {
  ADMIN = "ADMIN"
}
