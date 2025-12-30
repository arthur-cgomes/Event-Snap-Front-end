import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Event } from '../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import { CalendarIcon, EyeIcon, ClockIcon, PencilIcon, AlertTriangleIcon } from './icons';

interface EventCardProps {
  event: Event;
  onShowQr: (event: Event) => void;
  onViewMedia: (event: Event) => void;
  onEditName: (event: Event) => void;
}

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('pt-BR');
};

const EventCard: React.FC<EventCardProps> = ({ event, onShowQr, onViewMedia, onEditName }) => {
  const isExpired = new Date() > new Date(event.expiresAt);

  const getWarning = (): { color: string; days: number } | null => {
    if (isExpired) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiresAtDate = new Date(event.expiresAt);
    expiresAtDate.setHours(0, 0, 0, 0);

    const diffTime = expiresAtDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { color: 'text-red-500', days: 0 };
    }
    if (diffDays <= 2) {
      return { color: 'text-orange-500', days: diffDays };
    }
    if (diffDays <= 3) {
      return { color: 'text-yellow-500', days: diffDays };
    }

    return null;
  };

  const warning = getWarning();

  const getTooltipText = (days: number): string => {
    if (days <= 0) return "Expira hoje";
    if (days === 1) return "1 dia para expirar seu QR Code";
    return `${days} dias para expirar seu QR Code`;
  };

  return (
    <Card className="flex flex-col transition-all hover:shadow-xl hover:-translate-y-1">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 flex-grow min-w-0">
            <CardTitle className="pr-2 truncate">{event.name}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => onEditName(event)}>
            <PencilIcon className="h-4 w-4" />
            <span className="sr-only">Editar nome do evento</span>
          </Button>
        </div>
        <div className="flex items-center text-sm text-muted-foreground pt-1">
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>Criado em: {formatDate(event.createdAt)}</span>
        </div>
        <div className={`flex items-center text-sm pt-1 ${isExpired ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
          <ClockIcon className="mr-2 h-4 w-4" />
          <span>Expira em: {formatDate(event.expiresAt)}</span>
          {warning && (
            <div className="relative group ml-2 flex items-center">
              <AlertTriangleIcon className={`h-5 w-5 ${warning.color}`} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max whitespace-nowrap hidden group-hover:block bg-card border text-card-foreground text-xs rounded py-1 px-2 z-10 shadow-lg">
                {getTooltipText(warning.days)}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center justify-center p-4 bg-muted rounded-md">
          <QRCodeSVG
            value={`${window.location.origin}/#/event/${event.id}`}
            size={128}
            bgColor={"#FFFFFF"}
            fgColor={"#17191C"}
            level={"L"}
            includeMargin={false}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Escaneie para testar a página de upload.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button variant="outline" className="w-full" onClick={() => onShowQr(event)}>
          Ver QR Code
        </Button>
        <Button className="w-full" onClick={() => onViewMedia(event)}>
          <EyeIcon className="mr-2 h-4 w-4" />
          Ver Mídias
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;