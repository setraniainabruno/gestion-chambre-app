
import { ChangeEvent, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Save, Mail, BellRing, User, LogOut, Smartphone, Shield } from 'lucide-react';
import api from '@/lib/api';

const SettingsPage = () => {
  const [info, setInfo] = useState(JSON.parse(sessionStorage.getItem('user')));
  const [user, setUser] = useState({
    nom: info.nom,
    prenom: info.prenom,
    email: info.email,
    roles: info.roles
  });
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [ancienMdp, setAncienMdp] = useState<string | null>('');
  const [mdp, setMdp] = useState<string | null>('');
  const [confMdp, setConfMdp] = useState<string | null>('');

  const recVal = (e: ChangeEvent<HTMLInputElement>): void => {
    setUser((user: any) => ({ ...user, [e.target.name]: e.target.value }));
  }

  const handleSave = async () => {

    try {
      setLoading(true);

      const res = await api.put(`/utilisateurs/${info.id}`, user);
      if (!res) {
        setLoading(false);
        return
      }

      const userInfo = await api.get(`/utilisateurs/${info.id}`);
      if (userInfo) {
        sessionStorage.setItem("user", JSON.stringify(userInfo.data));
        setInfo(userInfo.data);
      }

      setTimeout(() => {
        setLoading(false);
        toast({
          title: 'Paramètres enregistrés',
          description: 'Vos paramètres ont été enregistrés avec succès.',
        });
      }, 1000);

    } catch (error) {
      console.error(error);
    }
  };
  const handleSaveMdp = async () => {

    try {
      setLoading(true);

      if (mdp != confMdp) {
        setTimeout(() => {
          setLoading(false);
          toast({
            title: 'Erreur',
            description: 'Mot de passe différent.',
          });
        }, 500);
        return
      }
      if (mdp.length < 4) {
        setTimeout(() => {
          setLoading(false);
          toast({
            title: 'Erreur',
            description: 'Mot de passe très court.',
          });
        }, 500);
        return
      }

      const res = await api.put(`/utilisateurs/${info.id}/mot-de-passe`,
        { mdp, ancienMdp },
        {
          headers: { "Content-Type": "application/json" }
        }
      );
if (!res) {
  setLoading(false);
  return
}

setTimeout(() => {
  setLoading(false);
  toast({
    title: 'Paramètres enregistrés',
    description: 'Votre mot de passe a été modifié avec succès.',
  });
}, 500);
    } catch (error) {
  setLoading(false);
  console.error(error);
}
  };



return (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
    </div>

    <Tabs defaultValue="account" className="space-y-6">
      <TabsList>
        <TabsTrigger value="account">Compte</TabsTrigger>
        <TabsTrigger value="security">Sécurité</TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
            <CardDescription>
              Gérez vos informations personnelles et vos préférences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {info?.prenom?.charAt(0)}{info?.nom?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{info?.prenom} {info?.nom}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    {user?.roles}
                  </Badge>
                  <span className="text-sm text-muted-foreground">·</span>
                  <span className="text-sm text-muted-foreground">Actif</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" name='prenom' value={user?.prenom} onChange={recVal} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" name='nom' value={user?.nom} onChange={recVal} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" name='email' value={user?.email} onChange={recVal} />
              </div>

              <div className="flex justify-center md:justify-end">
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? 'Enregistrement...' : <><Save className="mr-2 h-4 w-4" /> Enregistrer</>}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>



      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Sécurité et connexion</CardTitle>
            <CardDescription>
              Gérez la sécurité de votre compte et les paramètres de connexion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Mot de passe</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                  <Input id="currentPassword" type="password"
                    value={ancienMdp}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setAncienMdp(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input id="newPassword" type="password"
                      value={mdp}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setMdp(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input id="confirmPassword" type="password"
                      value={confMdp}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setConfMdp(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveMdp}>
                    {loading ? 'Enregistrement...' : 'Modifier le mot de passe'}

                  </Button>
                </div>
              </div>
            </div>



          </CardContent>
        </Card>
      </TabsContent>

    </Tabs>
  </div>
);
};

export default SettingsPage;
