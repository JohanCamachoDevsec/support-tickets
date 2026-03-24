import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTickets } from '@/hooks/useTickets';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketList } from '@/components/TicketList';
import { CreateTicketForm } from '@/components/CreateTicketForm';
import { UserManagement } from '@/components/UserManagement';
import { AuditLog } from '@/components/AuditLog';
import { Plus, LayoutDashboard, Users, ShieldCheck } from 'lucide-react';
import { UserRole } from '@/types/User';

export default function DashboardPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { useGetTickets } = useTickets();
  const { data: tickets, isLoading: ticketsLoading } = useGetTickets();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
          <p className="text-muted-foreground">
            Hola, {user?.name}. {isAdmin ? 'Gestiona todo el sistema de soporte.' : 'Gestiona tus solicitudes de soporte.'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold text-primary">{user?.role}</p>
          </div>
          <Button variant="outline" onClick={() => logout()}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <Tabs defaultValue="tickets" className="flex flex-col space-y-6">
        {isAdmin && (
          <TabsList className="grid w-full max-w-[600px] grid-cols-3">
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" /> Tickets
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Usuarios
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> Auditoría
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="tickets" className="space-y-6">
          {!isAdmin && user?.role !== UserRole.AGENT && (
            <div className="flex justify-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Ticket</DialogTitle>
                    <DialogDescription>
                      Describe tu problema y nos pondremos en contacto contigo lo antes posible.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <CreateTicketForm onSuccess={() => setIsDialogOpen(false)} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>{isAdmin ? 'Todos los Tickets del Sistema' : 'Listado de Tickets'}</CardTitle>
            </CardHeader>
            <CardContent>
              {ticketsLoading ? (
                <p className="text-center py-4 text-muted-foreground">Cargando tickets...</p>
              ) : (
                <TicketList tickets={tickets || []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Auditoría del Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <AuditLog />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
