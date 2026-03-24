import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from '@/hooks/useUsers';
import { toast } from 'sonner';
import { UserRole } from '@/types/User';

const userSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Formato de email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  role: z.enum(UserRole, {
    error: "Rol no válido"
  }),
});

type UserFormValues = z.infer<typeof userSchema>;

interface CreateUserFormProps {
  onSuccess?: () => void;
}

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const { useCreateUser } = useUsers();
  const createUser = useCreateUser();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: UserRole.AGENT,
    }
  });

  const selectedRole = watch('role');

  const onSubmit = (data: UserFormValues) => {
    createUser.mutate(data, {
      onSuccess: () => {
        toast.success('Usuario creado correctamente');
        reset();
        if (onSuccess) onSuccess();
      },
      onError: (error: any) => {
        toast.error('Error al crear el usuario', {
          description: error.response?.data?.error || 'Por favor, inténtelo de nuevo.',
        });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre Completo</Label>
        <Input
          id="name"
          placeholder="Juan Pérez"
          {...register('name')}
          aria-invalid={!!errors.name}
          className={errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        {errors.name && (
          <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="juan.perez@ejemplo.com"
          {...register('email')}
          aria-invalid={!!errors.email}
          className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        {errors.email && (
          <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          {...register('password')}
          aria-invalid={!!errors.password}
          className={errors.password ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        {errors.password && (
          <p className="text-xs font-medium text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Select
          value={selectedRole}
          onValueChange={(value) => setValue('role', value as any)}
        >
          <SelectTrigger className={errors.role ? 'border-destructive focus-visible:ring-destructive' : ''}>
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
            <SelectItem value={UserRole.AGENT}>Agente</SelectItem>
            <SelectItem value={UserRole.CLIENT}>Cliente</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-xs font-medium text-destructive">{errors.role.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={createUser.isPending}>
        {createUser.isPending ? 'Creando...' : 'Crear Usuario'}
      </Button>
    </form>
  );
}
