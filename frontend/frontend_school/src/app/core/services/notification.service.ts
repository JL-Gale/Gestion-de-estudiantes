import { Injectable, signal } from '@angular/core';

export interface ToastNotification {
  id: number;
  type: 'success' | 'danger' | 'warning' | 'info';
  title?: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSignal = signal<ToastNotification[]>([]);
  public notifications = this.notificationsSignal.asReadonly();
  private nextId = 1;

  public show(message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'info', title?: string) {
    // Evitar notificaciones duplicadas idénticas simultáneas
    const current = this.notificationsSignal();
    const isDuplicate = current.some(n => n.message === message && n.type === type);
    if (isDuplicate) {
      return;
    }

    const id = this.nextId++;
    const toast: ToastNotification = { id, type, title, message };
    this.notificationsSignal.update(list => [...list, toast]);

    setTimeout(() => {
      this.remove(id);
    }, 5000);
  }

  public success(message: string, title: string = 'Éxito') {
    this.show(message, 'success', title);
  }

  public error(message: string, title: string = 'Error') {
    this.show(message, 'danger', title);
  }

  public warning(message: string, title: string = 'Atención') {
    this.show(message, 'warning', title);
  }

  public info(message: string, title: string = 'Información') {
    this.show(message, 'info', title);
  }

  public remove(id: number) {
    this.notificationsSignal.update(list => list.filter(n => n.id !== id));
  }
}

