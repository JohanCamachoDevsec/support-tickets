import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AuditFilters } from '@/services/auditService';
import { auditService } from '@/services/auditService';
import { useUsers } from '@/hooks/useUsers';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from 'lucide-react';
import type { TicketHistory } from '@/types/TicketHistory';

/**
 * Definición de los campos permitidos en la auditoría.
 * Actualmente el sistema solo trackea cambios de estado y prioridad.
 */
export type AuditField = 'status' | 'priority';

/**
 * Interfaz estricta para los registros de auditoría que devuelve auditService.
 */
export interface StrictAuditEntry extends Omit<TicketHistory, 'field'> {
  field: AuditField;
}

export function AuditLog() {
  const [filters, setFilters] = useState<AuditFilters>({
    userId: undefined,
    field: '',
    startDate: '',
    endDate: '',
  });

  const [appliedFilters, setAppliedFilters] = useState<AuditFilters>({});
  const [ticketIdFilter, setTicketIdFilter] = useState<string>("all");
  const { useGetUsers } = useUsers();
  const { data: allUsers } = useGetUsers();

  const { data, isLoading, error } = useQuery({
    queryKey: ['audit', appliedFilters],
    queryFn: () => auditService.getGlobalAudit(appliedFilters),
  });

  // Cast a la interfaz estricta solicitada.
  // Se asume que el backend solo envía campos de auditoría válidos ('status', 'priority').
  const auditData = data as StrictAuditEntry[] | undefined;

  /**
   * Extrae los tickets únicos de los datos cargados.
   */
  const uniqueTickets = useMemo(() => {
    if (!auditData) return [];
    const ticketsMap = new Map<number, { id: number; title: string }>();
    auditData.forEach((entry) => {
      if (entry.ticket && !ticketsMap.has(entry.ticket.id)) {
        ticketsMap.set(entry.ticket.id, { id: entry.ticket.id, title: entry.ticket.title });
      }
    });
    return Array.from(ticketsMap.values()).sort((a, b) => a.id - b.id);
  }, [auditData]);

  /**
   * Filtra los datos de auditoría en el frontend por ticket.
   */
  const filteredAuditData = useMemo(() => {
    if (!auditData) return [];
    if (ticketIdFilter === "all") return auditData;
    return auditData.filter((entry) => entry.ticket.id.toString() === ticketIdFilter);
  }, [auditData, ticketIdFilter]);

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleResetFilters = () => {
    const reset = { userId: undefined, field: '', startDate: '', endDate: '' };
    setFilters(reset);
    setAppliedFilters(reset);
    setTicketIdFilter("all");
  };

  const formatValue = (field: AuditField, value: string | null) => {
    if (value === null || value === undefined) return <span className="text-muted-foreground italic text-xs">nulo</span>;
    if (field === 'status') {
      return <Badge variant="outline" className="text-[10px]">{value}</Badge>;
    }
    if (field === 'priority') {
      return <Badge variant="secondary" className="text-[10px]">{value}</Badge>;
    }
    return <span className="text-xs truncate max-w-[150px] inline-block">{value}</span>;
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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5 items-end border p-4 rounded-lg bg-muted/20">
        <div className="space-y-2">
          <Label htmlFor="user" className="text-xs font-bold uppercase">Usuario</Label>
          <Select
            value={filters.userId?.toString() || "all"}
            onValueChange={(val) => setFilters({ ...filters, userId: val === "all" ? undefined : Number(val) })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {allUsers?.map((u) => (
                <SelectItem key={u.id} value={u.id.toString()}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="field" className="text-xs font-bold uppercase">Campo</Label>
          <Input
            id="field"
            placeholder="status, priority..."
            value={filters.field}
            onChange={(e) => setFilters({ ...filters, field: e.target.value })}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-xs font-bold uppercase">Desde</Label>
          <Input
            id="startDate"
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-xs font-bold uppercase">Hasta</Label>
          <Input
            id="endDate"
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="h-8 text-xs"
          />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleApplyFilters} className="flex-1 h-8 text-xs">
            <Search className="mr-2 h-3 w-3" /> Filtrar
          </Button>
          <Button size="sm" variant="outline" onClick={handleResetFilters} className="h-8 text-xs">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="ticket-filter" className="text-xs font-bold uppercase">Ticket:</Label>
          <Select value={ticketIdFilter} onValueChange={setTicketIdFilter}>
            <SelectTrigger id="ticket-filter" className="w-[250px] h-8 text-xs">
              <SelectValue placeholder="Todos los tickets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tickets</SelectItem>
              {uniqueTickets.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  #{t.id} - {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase">
          Mostrando {filteredAuditData.length} registros
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs font-bold uppercase">Ticket</TableHead>
              <TableHead className="text-xs font-bold uppercase">Campo</TableHead>
              <TableHead className="text-xs font-bold uppercase">Anterior</TableHead>
              <TableHead className="text-xs font-bold uppercase">Nuevo</TableHead>
              <TableHead className="text-xs font-bold uppercase">Usuario</TableHead>
              <TableHead className="text-right text-xs font-bold uppercase">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Cargando registros de auditoría...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-destructive font-medium">
                  Error al cargar la auditoría.
                </TableCell>
              </TableRow>
            ) : filteredAuditData && filteredAuditData.length > 0 ? (
              filteredAuditData.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">#{entry.ticket.id}</span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{entry.ticket.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-xs">
                    {getFieldName(entry.field)}
                  </TableCell>
                  <TableCell>{formatValue(entry.field, entry.oldValue)}</TableCell>
                  <TableCell>{formatValue(entry.field, entry.newValue)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{entry.changedBy?.name || 'Sistema'}</span>
                      <span className="text-[9px] text-muted-foreground uppercase">{entry.changedBy?.role || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs whitespace-nowrap">
                    {new Date(entry.createdAt).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No se encontraron registros de auditoría.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
