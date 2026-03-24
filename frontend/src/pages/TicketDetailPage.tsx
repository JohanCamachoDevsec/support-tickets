import { useParams, useNavigate } from 'react-router-dom';
import { useTickets } from '@/hooks/useTickets';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { StatusBadge } from '@/components/StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TicketHistoryList } from "@/components/TicketHistoryList";
import { ArrowLeft, Send, MessageSquareText, RefreshCcw, CheckCircle2, PlayCircle, User as UserIcon, Lock, History } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { TicketStatus, TicketPriority } from '@/types/Ticket';
import { UserRole } from '@/types/User';
import * as React from "react";


export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { useGetTicket, useAddComment, useChangeStatus, useUpdatePriority, useAssignTicket } = useTickets();
  const { useGetAgents } = useUsers();

  const { data: ticket, isLoading, error } = useGetTicket(Number(id));
  const { data: agents } = useGetAgents({
    enabled: user?.role === UserRole.ADMIN || user?.role === UserRole.AGENT
  });

  const addComment = useAddComment(Number(id));
  const changeStatus = useChangeStatus(Number(id));
  const updatePriority = useUpdatePriority(Number(id));
  const assignTicket = useAssignTicket(Number(id));

  const [commentContent, setCommentContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const handleStatusChange = (newStatus: TicketStatus) => {
    changeStatus.mutate(newStatus, {
      onSuccess: () => {
        toast.success(`Estado actualizado a ${newStatus}`);
      },
      onError: (error: any) => {
        toast.error('Error al cambiar el estado', {
          description: error.response?.data?.error || 'Por favor, inténtelo de nuevo.',
        });
      }
    });
  };

  const handlePriorityChange = (newPriority: string) => {
    updatePriority.mutate(newPriority, {
      onSuccess: () => {
        toast.success(`Prioridad actualizada a ${newPriority}`);
      },
      onError: (error: any) => {
        toast.error('Error al cambiar la prioridad', {
          description: error.response?.data?.error || 'Por favor, inténtelo de nuevo.',
        });
      }
    });
  };

  const handleAssignAgent = (agentId: string) => {
    assignTicket.mutate(Number(agentId), {
      onSuccess: () => {
        toast.success('Agente asignado correctamente');
      },
      onError: (error: any) => {
        toast.error('Error al asignar agente', {
          description: error.response?.data?.error || 'Por favor, inténtelo de nuevo.',
        });
      }
    });
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    addComment.mutate({ content: commentContent, isInternal }, {
      onSuccess: () => {
        toast.success('Respuesta enviada');
        setCommentContent('');
        setIsInternal(false);
      },
      onError: (error: any) => {
        toast.error('Error al enviar respuesta', {
          description: error.response?.data?.error || 'Por favor, inténtelo de nuevo.',
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Cargando detalle del ticket...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </Button>
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive font-medium">Error al cargar el ticket o ticket no encontrado.</p>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="mt-4">
              Ir al Panel Principal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = user?.role === UserRole.ADMIN;
  const isAssignedAgent = user?.role === UserRole.AGENT && ticket?.assignedTo?.id === user?.id;
  const canSeeHistory = isAdmin || isAssignedAgent;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 hover:bg-transparent px-0">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a mis tickets
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{ticket.title}</h1>
        <p className="text-muted-foreground">
          Creado el {new Date(ticket.createdAt).toLocaleString()} por {ticket.createdBy.name}
        </p>
      </div>

      <Tabs defaultValue="conversation" className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
          {/* Panel Izquierdo: Conversación / Historial */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            <TabsList className={`grid w-full ${canSeeHistory ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <TabsTrigger value="conversation" className="flex items-center gap-2">
                <MessageSquareText className="h-4 w-4" /> Conversación
              </TabsTrigger>
              {canSeeHistory && (
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" /> Historial
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="conversation" className="space-y-6 mt-0">
              <Alert className="bg-muted/50 border-none shadow-sm">
                <MessageSquareText className="h-4 w-4" />
                <AlertTitle className="text-sm font-semibold">Descripción del problema</AlertTitle>
                <AlertDescription className="mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                  {ticket.description}
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold px-1">Conversación</h3>
                <div className="flex flex-col gap-4">
                  {ticket.comments && ticket.comments.length > 0 ? (
                    [...ticket.comments]
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map((c) => (
                        <div
                          key={c.id}
                          className={`flex flex-col gap-2 rounded-2xl p-4 text-sm shadow-sm ${
                            c.author.id === user?.id
                              ? `ml-auto max-w-[80%] ${c.isInternal ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-primary text-primary-foreground'} rounded-tr-none`
                              : `mr-auto max-w-[80%] border ${c.isInternal ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-card'} rounded-tl-none`
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs uppercase tracking-wider">{c.author.name}</span>
                              {c.isInternal && (
                                <Badge variant="outline" className="h-4 px-1 text-[8px] border-amber-400 text-amber-700 bg-amber-100/50 flex items-center gap-0.5">
                                  <Lock className="h-2 w-2" /> INTERNO
                                </Badge>
                              )}
                            </div>
                            <span className={`text-[10px] ${c.author.id === user?.id && !c.isInternal ? 'opacity-70' : 'text-muted-foreground'}`}>
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap">{c.content}</p>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl bg-muted/20">
                      No hay comentarios todavía en este ticket.
                    </div>
                  )}
                </div>
              </div>

              <Card className="shadow-lg border-primary/20">
                <CardContent className="pt-6">
                  <form onSubmit={handleSendComment} className="flex flex-col gap-3">
                    <Textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Escribe una respuesta para el equipo de soporte..."
                      className="min-h-25 resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {(user?.role === UserRole.ADMIN || user?.role === UserRole.AGENT) && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="internal"
                              checked={isInternal}
                              onCheckedChange={(checked) => setIsInternal(checked as boolean)}
                            />
                            <Label
                              htmlFor="internal"
                              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1 cursor-pointer"
                            >
                              <Lock className="h-3 w-3" /> Mensaje Interno (Solo personal)
                            </Label>
                          </div>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={!commentContent.trim() || addComment.isPending}
                        className="px-8"
                      >
                        {addComment.isPending ? 'Enviando...' : (
                          <>
                            Responder <Send className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {canSeeHistory && (
              <TabsContent value="history" className="mt-0 space-y-4">
                <h3 className="text-lg font-semibold px-1">Historial de Auditoría</h3>
                <TicketHistoryList ticketId={Number(id)} />
              </TabsContent>
            )}
          </div>

          {/* Panel Derecho: Detalles y Acciones */}
          <div className="space-y-6 min-w-0">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Detalles del Ticket</CardTitle>
                <CardDescription>Información general y controles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Estado</span>
                    <StatusBadge status={ticket.status} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Prioridad</span>
                    {(user?.role === UserRole.ADMIN || user?.role === UserRole.AGENT) ? (
                      <Select
                        defaultValue={ticket.priority}
                        onValueChange={handlePriorityChange}
                        disabled={updatePriority.isPending}
                      >
                        <SelectTrigger className="h-8 w-[110px] text-xs">
                          <SelectValue placeholder="Prioridad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={TicketPriority.LOW}>BAJA</SelectItem>
                          <SelectItem value={TicketPriority.MEDIUM}>MEDIA</SelectItem>
                          <SelectItem value={TicketPriority.HIGH}>ALTA</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline">{ticket.priority}</Badge>
                    )}
                  </div>

                  {(user?.role === UserRole.ADMIN || user?.role === UserRole.AGENT) && (
                    <div className="space-y-2 pt-2 border-t">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Agente Asignado</Label>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        <Select
                          defaultValue={ticket.assignedTo?.id?.toString() || "unassigned"}
                          onValueChange={handleAssignAgent}
                          disabled={assignTicket.isPending || user?.role !== UserRole.ADMIN}
                        >
                          <SelectTrigger className="h-9 w-full text-xs">
                            <SelectValue placeholder="Asignar Agente" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Sin asignar</SelectItem>
                            {agents?.map((agent) => (
                              <SelectItem key={agent.id} value={agent.id.toString()}>
                                {agent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t flex flex-col gap-2">
                  {user?.role === UserRole.AGENT && (
                    <>
                      {(ticket.status === TicketStatus.OPEN || ticket.status === TicketStatus.REOPENED) && (
                        <Button
                          className="w-full"
                          onClick={() => handleStatusChange(TicketStatus.IN_PROGRESS)}
                          disabled={changeStatus.isPending}
                        >
                          <PlayCircle className="mr-2 h-4 w-4" /> Atender Ticket
                        </Button>
                      )}
                      {ticket.status === TicketStatus.IN_PROGRESS && (
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => handleStatusChange(TicketStatus.CLOSED)}
                          disabled={changeStatus.isPending}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Cerrar Ticket
                        </Button>
                      )}
                    </>
                  )}

                  {user?.role === UserRole.CLIENT && ticket.status === TicketStatus.CLOSED && (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => handleStatusChange(TicketStatus.REOPENED)}
                      disabled={changeStatus.isPending}
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" /> Reabrir Ticket
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
