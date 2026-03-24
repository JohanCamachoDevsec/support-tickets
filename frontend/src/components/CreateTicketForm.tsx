import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTickets } from '@/hooks/useTickets';
import { toast } from 'sonner';

const ticketSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

interface CreateTicketFormProps {
  onSuccess?: () => void;
}

export function CreateTicketForm({ onSuccess }: CreateTicketFormProps) {
  const { useCreateTicket } = useTickets();
  const createTicket = useCreateTicket();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
  });

  const onSubmit = (data: TicketFormValues) => {
    createTicket.mutate(data, {
      onSuccess: () => {
        toast.success('Ticket creado correctamente', {
          description: 'Nuestro equipo lo revisará pronto.',
        });
        reset();
        if (onSuccess) onSuccess();
      },
      onError: (error: any) => {
        toast.error('Error al crear el ticket', {
          description: error.response?.data?.error || 'Por favor, inténtelo de nuevo.',
        });
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          placeholder="Ej: Problema con el acceso a la cuenta"
          {...register('title')}
          aria-invalid={!!errors.title}
          className={errors.title ? 'border-destructive focus-visible:ring-destructive' : ''}
        />
        {errors.title && (
          <p className="text-xs font-medium text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Describe detalladamente tu problema..."
          {...register('description')}
          aria-invalid={!!errors.description}
          className={`resize-none ${
            errors.description ? 'border-destructive focus-visible:ring-destructive' : ''
          }`}
        />
        {errors.description && (
          <p className="text-xs font-medium text-destructive">{errors.description.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={createTicket.isPending}>
        {createTicket.isPending ? 'Creando...' : 'Enviar Ticket'}
      </Button>
    </form>
  );
}
