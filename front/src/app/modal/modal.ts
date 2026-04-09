// src/app/modal/modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class ModalComponent {

  // @Input() means the PARENT component can pass data INTO this component
  @Input() message: string = '';

  // @Output() + EventEmitter means this component can send events UP to the parent
  // We'll use this to tell the parent "the user wants to close the modal"
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit(); // fires the event, the parent will react to it
  }
}
