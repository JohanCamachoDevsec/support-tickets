import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginType } from '@/types/Auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import axios from 'axios';

export default function LoginPage() {
  const { login, isLoggingIn, loginError } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginType>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = (data: LoginType) => {
    login(data, {
      onSuccess: () => {
        toast.success('¡Bienvenido!', {
          description: 'Has iniciado sesión correctamente.',
        });
        navigate('/dashboard');
      },
      onError: (error: any) => {
        toast.error('Error de autenticación', {
          description: axios.isAxiosError(error) && error.response?.status === 401
            ? 'Correo o contraseña incorrectos'
            : 'Ocurrió un error al intentar iniciar sesión.',
        });
      }
    });
  };

  // Obtener mensaje de error genérico para el usuario
  const getErrorMessage = () => {
    if (!loginError) return null;

    // El error real se registra en consola para debugging
    console.error('Error de autenticación:', loginError);

    // Mensaje amigable dependiendo del tipo de error
    if (axios.isAxiosError(loginError) && loginError.response?.status === 401) {
      return 'Correo o contraseña incorrectos';
    }

    return 'Ocurrió un error, intenta de nuevo';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tu correo y contraseña para acceder a tu cuenta
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
                disabled={isLoggingIn}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
              </div>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={errors.password ? 'border-destructive' : ''}
                disabled={isLoggingIn}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? 'Entrando...' : 'Entrar'}
            </Button>
            <div className="text-center text-sm">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Regístrate aquí
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
