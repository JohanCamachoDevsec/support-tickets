import { useTickets } from "@/hooks/useTickets";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import type { TicketHistory } from "@/types/TicketHistory";

/**
 * Definición de los campos permitidos en la auditoría del ticket.
 * Actualmente, el sistema solo trackea cambios de estado y prioridad.
 */
export type AuditField = 'status' | 'priority';

/**
 * Interfaz estricta para los registros de auditoría que devuelve useGetTicketHistory.
 */
export interface StrictTicketHistory extends Omit<TicketHistory, 'field'> {
  field: AuditField;
}

interface TicketHistoryListProps {
  ticketId: number;
}

export function TicketHistoryList({ ticketId }: TicketHistoryListProps) {
  const { useGetTicketHistory } = useTickets();
  const { data, isLoading, error } = useGetTicketHistory(ticketId);

  // Cast a la interfaz estricta solicitada.
  // Se asume que el backend solo envía campos de auditoría válidos ('status', 'priority').
  const history = data as StrictTicketHistory[] | undefined;

  useAuth();

  if (isLoading) return <div className="py-4 text-center">Cargando historial...</div>;
  if (error) return <div className="py-4 text-center text-destructive font-medium">Error al cargar el historial.</div>;

  if (!history || history.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/20">
        No hay registros en el historial de este ticket.
      </div>
    );
  }

  /**
   * Formatea visualmente los valores del historial según el tipo de campo.
   */
  const formatValue = (field: AuditField, value: string | null) => {
    if (value === null || value === undefined) return <span className="text-muted-foreground italic">nulo</span>;

    if (field === 'status') {
      return <Badge variant="outline" className="text-[10px]">{value}</Badge>;
    }

    if (field === 'priority') {
      return <Badge variant="secondary" className="text-[10px]">{value}</Badge>;
    }

    return value;
  };

  /**
   * Traduce el nombre técnico del campo a uno legible.
   */
  const getFieldName = (field: AuditField) => {
    const fields: Record<AuditField, string> = {
      status: 'Estado',
      priority: 'Prioridad'
    };
    return fields[field] || field;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campo</TableHead>
            <TableHead>Valor Anterior</TableHead>
            <TableHead>Valor Nuevo</TableHead>
            <TableHead>Modificado por</TableHead>
            <TableHead className="text-right">Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-medium">{getFieldName(entry.field)}</TableCell>
              <TableCell>{formatValue(entry.field, entry.oldValue)}</TableCell>
              <TableCell>{formatValue(entry.field, entry.newValue)}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">{entry.changedBy?.name || 'Sistema'}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">{entry.changedBy?.role || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                {new Date(entry.createdAt).toLocaleString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
