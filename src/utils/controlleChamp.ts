export class ControlleChamps {
    public nombre(mot: string): string {
        return mot.replace(/[^0-9]/, '');
    }

    public lettre(mot: string): string {
        return mot.replace(/[^a-zA-Z ]/, '');
    }
    public lettreNombre(mot: string): string {
        return mot.replace(/[^a-zA-Z0-9 ]/, '');
    }

    public taille(mot: string, len: number): string {
        return mot.length > len ? mot.slice(0, len) : mot;
    }
}

