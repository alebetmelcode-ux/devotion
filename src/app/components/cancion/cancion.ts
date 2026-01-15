import {
  Component,
  inject,
  signal,
  effect,
  ElementRef,
  OnInit,
  AfterViewInit,
  Output,
  EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { SongService } from '../../services/song.service';
import { TransposeService } from '../../services/transpose.service';
import { CategoriaService } from '../../services/categoria.service';

import { Song } from '../../models/song.model';
import { Categoria } from '../../../interfaces/categoria';

import { ToolbarComponent } from '../toolbar/toolbar';
import { LucideAngularModule } from 'lucide-angular';
import { AutoCompleteModule } from 'primeng/autocomplete';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PPTXGenJS from 'pptxgenjs';

@Component({
  selector: 'app-cancion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToolbarComponent,
    LucideAngularModule,
    AutoCompleteModule
  ],
  templateUrl: './cancion.html',
  styleUrls: ['./cancion.css']
})
export class Cancion implements OnInit, AfterViewInit {

  /* ===================== Servicios ===================== */
  private songService = inject(SongService);
  private transposeService = inject(TransposeService);
  private categoriaService = inject(CategoriaService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  constructor(private elRef: ElementRef) {}

  /* ===================== Outputs ===================== */
  @Output() songSaved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  /* ===================== Estado ===================== */
  songForm!: FormGroup;

  categorias: Categoria[] = [];
  categoriasCargando = true;

  songs: Song[] = [];
  cancionesCargando = true;

  filteredSongs: Song[] = [];

  songToEdit = this.songService.songToEdit;

  highlightedLyrics = '';
  private lyricsBackdrop: HTMLElement | null = null;

  /* ===================== INIT ===================== */
  ngOnInit(): void {
    this.songForm = this.fb.group({
      id: [null],
      tituloCancion: ['', Validators.required],
      tonoOriginal: ['C', Validators.required],
      idCategoria: [null, Validators.required],
      idCancion: [null],
      letra: ['', Validators.required]
    });

    this.songForm.get('letra')!
      .valueChanges
      .subscribe(value => this.updateHighlight(value ?? ''));

    this.loadCategorias();
    this.loadSongs();

    effect(() => {
      const song = this.songToEdit();
      song ? this.populateForm(song) : this.resetForm();
    });
  }

  ngAfterViewInit(): void {
    this.lyricsBackdrop =
      this.elRef.nativeElement.querySelector('.lyrics-backdrop');
  }

  /* ===================== CARGA DATOS ===================== */
  loadCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: res => {
        this.categorias = res;
        this.categoriasCargando = false;
      },
      error: err => {
        console.error('Error categorías', err);
        this.categoriasCargando = false;
      }
    });
  }

  loadSongs(): void {
    this.songService.getSongs().subscribe({
      next: (res: any) => {
        this.songs = res.resultado ?? res;
        this.filteredSongs = [...this.songs];
        this.cancionesCargando = false;
      },
      error: err => {
        console.error('Error canciones', err);
        this.cancionesCargando = false;
      }
    });
  }

  /* ===================== AUTOCOMPLETE ===================== */
  filterSongs(event: any): void {
    const query = (event.query ?? '').toLowerCase();

    this.filteredSongs = this.songs.filter(song =>
      song.tituloCancion.toLowerCase().includes(query) ||
      song.letra?.toLowerCase().includes(query)
    );
  }

  onSongSelected(event: any): void {
    const song: Song = event.value;

    this.songForm.patchValue({
      tituloCancion: song.tituloCancion,
      tonoOriginal: song.tonoOriginal,
      idCategoria: song.idCategoria,
      letra: song.letra,
      idCancion: song.id
    });

    this.updateHighlight(song.letra);
  }

  /* ===================== FORM ===================== */
  populateForm(song: Song): void {
    this.songForm.patchValue({
      id: song.id,
      tituloCancion: song.tituloCancion,
      tonoOriginal: song.tonoOriginal,
      idCategoria: song.idCategoria,
      letra: song.letra
    });

    this.songForm.get('idCancion')?.disable();
    this.updateHighlight(song.letra);
  }

  resetForm(): void {
    this.songForm.reset({
      id: null,
      tituloCancion: '',
      tonoOriginal: 'C',
      idCategoria: null,
      idCancion: null,
      letra: ''
    });

    this.songForm.get('idCancion')?.enable();
    this.highlightedLyrics = '';
  }

  /* ===================== ACORDES ===================== */
updateHighlight(text: string): void {
  if (!text) {
    this.highlightedLyrics = '';
    return;
  }

  const chordRegex =
    /\b([A-G](?:#|b)?(?:maj|min|m|sus|dim|aug|add)?\d*(?:\/[A-G](?:#|b)?)?)\b/g;

  const titulo = this.songForm.get('tituloCancion')?.value ?? '';

  this.highlightedLyrics =
    `<h1 class="song-title">${titulo}</h1>` +
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(chordRegex, `<span class="chord-highlight">$1</span>`)
      .replace(/\n/g, '<br>');
}

  syncScroll(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    if (this.lyricsBackdrop) {
      this.lyricsBackdrop.scrollTop = textarea.scrollTop;
    }
  }

  /* ===================== TRANSPOSICIÓN ===================== */
  transposeUp(): void {
    this.transpose(1);
  }

  transposeDown(): void {
    this.transpose(-1);
  }

  private transpose(semitones: number): void {
    const key = (this.songForm.get('tonoOriginal')?.value ?? '').trim();
    const letra = this.songForm.get('letra')?.value ?? '';

    const newKey = this.transposeService.transposeChord(key, semitones);
    const newLetra = this.transposeService.transposeText(letra, semitones);

    this.songForm.patchValue({
      tonoOriginal: newKey,
      letra: newLetra
    });
  }

  /* ===================== CRUD ===================== */
  saveSong(): void {
    if (this.songForm.invalid) return;

    const { id, idCancion, ...songDto } = this.songForm.getRawValue();

    this.songService.addSong(songDto).subscribe({
      next: res => {
        alert(res.mensaje ?? 'Canción guardada correctamente ✅');
        this.songService.clearEditing();
        this.songSaved.emit();
        this.loadSongs();
      },
      error: err =>
        alert(err.error?.mensaje ?? 'Error al guardar canción ❌')
    });
  }

  onCancel(): void {
    this.songService.clearEditing();
    this.cancel.emit();
    this.router.navigate(['/cancion']);
  }

  /* ===================== EXPORT ===================== */
  exportPDF(): void {
    const doc = new jsPDF();
    doc.text(this.songForm.get('letra')!.value, 10, 10);
    doc.save(`${this.songForm.get('tituloCancion')!.value}.pdf`);
  }

  exportPPT(): void {
    const pptx = new PPTXGenJS();
    const slide = pptx.addSlide();
    slide.addText(this.songForm.get('letra')!.value, { x: 0.5, y: 0.5 });
    pptx.writeFile({ fileName: `${this.songForm.get('tituloCancion')!.value}.pptx` });
  }

  exportJPG(): void {
    if (!this.lyricsBackdrop) return;

    html2canvas(this.lyricsBackdrop).then(canvas => {
      const link = document.createElement('a');
      link.download = `${this.songForm.get('tituloCancion')!.value}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 1.0);
      link.click();
    });
  }
}
