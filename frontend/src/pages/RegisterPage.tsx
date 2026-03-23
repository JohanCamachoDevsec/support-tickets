import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, type RegisterType } from '../types/Auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import axios from 'axios';

export default function RegisterPage() {
  const { register: registerUser, isRegistering, registerError } = useAuth();
  const navigate = useNavigate();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterType>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = (data: RegisterType) => {
    registerUser(data, {
      onSuccess: () => {
        setIsSuccess(true);
        // Redirigir después de mostrar el mensaje de éxito por un momento
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    });
  };

  // Obtener mensaje de error genérico para el usuario
  const getErrorMessage = () => {
    if (!registerError) return null;

    // El error real se registra en consola para debugging
    console.error('Error de registro:', registerError);

    if (axios.isAxiosError(registerError)) {
      // Si el backend envía un error específico (como email ya registrado)
      const message = registerError.response?.data?.error;
      if (message && message.toLowerCase().includes('email')) {
        return 'Este correo electrónico ya está registrado';
      }
    }

    return 'Revisa los campos e intenta de nuevo';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Crear una cuenta</CardTitle>
          <CardDescription>
            Ingresa tus datos para registrarte en el sistema de tickets
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {isSuccess && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20">
                ¡Cuenta creada con éxito! Redirigiendo...
              </div>
            )}
            {registerError && !isSuccess && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20">
                {getErrorMessage()}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Juan Pérez"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
                disabled={isRegistering || isSuccess}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
                disabled={isRegistering || isSuccess}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
                disabled={isRegistering || isSuccess}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-red-500' : ''}
                disabled={isRegistering || isSuccess}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isRegistering || isSuccess}>
              {isRegistering ? 'Registrando...' : isSuccess ? '¡Listo!' : 'Registrarse'}
            </Button>
            <div className="text-center text-sm">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Inicia sesión aquí
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
