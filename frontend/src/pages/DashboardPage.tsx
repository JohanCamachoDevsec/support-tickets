import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Panel de Control</CardTitle>
              <CardDescription>
                Bienvenido al sistema de soporte de tickets
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => logout()}>
              Cerrar Sesión
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Información del Usuario</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Nombre:</span>
              <span>{user?.name}</span>
              <span className="text-muted-foreground">Correo:</span>
              <span>{user?.email}</span>
              <span className="text-muted-foreground">Rol:</span>
              <span className="capitalize">{user?.role?.toLowerCase()}</span>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-6 text-center dark:bg-blue-900/20">
            <p className="text-blue-600 dark:text-blue-400">
              Próximamente: Gestión de tickets y seguimiento de solicitudes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
