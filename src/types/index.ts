
// Types pour la gestion des chambres
export interface Room {
  id: string;
  numero: string;
  type: RoomType;
  etage: number;
  prix: number;
  capacite: number;
  statut: RoomStatus;
  description?: string;
}

export enum RoomType {
  SIMPLE = "Simple",
  DOUBLE = "Double",
  SUITE = "Suite",
  FAMILIALE = "Familiale",
  DELUXE = "Deluxe",
}

export enum RoomStatus {
  DISPONIBLE = "Disponible",
  OCCUPEE = "Occupée",
  MAINTENANCE = "Maintenance",
  NETTOYAGE = "Nettoyage",
  RESERVEE = "Réservée",
}

// Types pour la gestion des réservations
export interface Reservation {
  id: string;
  chambreId: string;
  clientId: string;
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
  EN_ATTENTE = "En attente",
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
  dateNaissance?: Date;
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
  role: UserRole;
}

export enum UserRole {
  ADMIN = "ADMIN"
}
