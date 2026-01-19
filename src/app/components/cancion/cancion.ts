import {
  Component,
  inject,
  OnInit,
  EventEmitter,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

/* PrimeNG */
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

/* Servicios */
import { SongService } from '../../services/song.service';
import { TransposeService } from '../../services/transpose.service';
import { CategoriaService } from '../../services/categoria.service';

/* Modelos */
import { Song } from '../../models/song.model';
import { Categoria } from '../../../interfaces/categoria';

/* Componentes */
import { ToolbarComponent } from '../toolbar/toolbar';

@Component({
  selector: 'app-cancion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    AutoCompleteModule,
    SelectModule,
    ButtonModule,
    ToolbarComponent
  ],
  templateUrl: './cancion.html',
  styleUrls: ['./cancion.css']
})
export class Cancion implements OnInit {

  private fb = inject(FormBuilder);
  private songService = inject(SongService);
  private transposeService = inject(TransposeService);
  private categoriaService = inject(CategoriaService);
  private router = inject(Router);

  @Output() songSaved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  songForm!: FormGroup;

  categorias: Categoria[] = [];
  songs: Song[] = [];
  filteredSongs: Song[] = [];

  highlightedLyrics = '';
  mode: 'edit' | 'view' = 'edit';

  ngOnInit(): void {
    this.songForm = this.fb.group({
      id: [null],
      tituloCancion: ['', Validators.required],
      tonoOriginal: ['C', Validators.required],
      idCategoria: [null, Validators.required],
      letra: ['', Validators.required]
    });

    this.songForm.get('letra')!
      .valueChanges
      .subscribe(text => this.updateHighlight(text ?? ''));

    this.loadCategorias();
    this.loadSongs();
  }

  /* ==================== DATOS ==================== */

  loadCategorias(): void {
    this.categoriaService.getCategorias().subscribe(res => {
      this.categorias = res;
    });
  }

  loadSongs(): void {
    this.songService.getSongs().subscribe((res: any) => {
      this.songs = res.resultado ?? res;
      this.filteredSongs = [...this.songs];
    });
  }

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
      id: song.id,
      tituloCancion: song.tituloCancion,
      tonoOriginal: song.tonoOriginal,
      idCategoria: song.idCategoria,
      letra: song.letra
    });
    this.updateHighlight(song.letra);
  }

  /* ==================== RENDER AVANZADO ==================== */

 updateHighlight(text: string): void {
  if (!text) {
    this.highlightedLyrics = '';
    return;
  }

  const titulo = this.songForm.get('tituloCancion')?.value ?? '';
  const tono = this.songForm.get('tonoOriginal')?.value ?? '';

  const safeLines = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .split('\n');

  let html = `
    <div class="song-header">
      <h1>${titulo}</h1>
      <div class="song-meta">Tono: ${tono}</div>
    </div>
  `;

  let sectionOpen = false;
  let pendingChords: string | null = null;

  for (let i = 0; i < safeLines.length; i++) {
    const raw = safeLines[i];
    const line = raw.trim();

    /* ===== LÍNEA VACÍA ===== */
    if (!line) {
      pendingChords = null;
      continue;
    }

    /* ===== ENCABEZADOS ===== */
    if (
      line.startsWith('//') ||
      /^(estrofa|verso|coro|chorus|verse)\b/i.test(line)
    ) {
      if (sectionOpen) {
        html += `</section>`;
      }

      html += `<section><h3>${line.replace('//', '').trim()}</h3>`;
      sectionOpen = true;
      pendingChords = null;
      continue;
    }

    /* ===== SOLO ACORDES ===== */
    if (/^([A-G][#b]?(m|maj|min|dim|aug|sus|add)?\d*\s*)+$/.test(line)) {
      pendingChords = line;
      continue;
    }

    /* ===== ACORDES INLINE ===== */
    const inlineRegex = /\[([^\]]+)\]/g;
    if (inlineRegex.test(raw)) {
      let chordLine = '';
      let lyricLine = '';
      let last = 0;
      let match: RegExpExecArray | null;

      while ((match = inlineRegex.exec(raw)) !== null) {
        const before = raw.slice(last, match.index);
        lyricLine += before;
        chordLine += ' '.repeat(before.length) + match[1];
        lyricLine += ' '.repeat(match[1].length);
        last = inlineRegex.lastIndex;
      }

      const rest = raw.slice(last);
      lyricLine += rest;
      chordLine += ' '.repeat(rest.length);

      html += `
        <div class="music-line">
          <div class="chords">
            ${chordLine.replace(/(\S+)/g, '<span class="chord">$1</span>')}
          </div>
          <div class="lyrics">${lyricLine}</div>
        </div>
      `;
      pendingChords = null;
      continue;
    }

    /* ===== LETRA NORMAL ===== */
    if (pendingChords) {
      const chordHtml = pendingChords.replace(
        /([A-G][#b]?(m|maj|min|dim|aug|sus|add)?\d*)/g,
        '<span class="chord">$1</span>'
      );

      html += `
        <div class="music-line">
          <div class="chords">${chordHtml}</div>
          <div class="lyrics">${raw}</div>
        </div>
      `;
      pendingChords = null;
    } else {
      html += `<div class="lyrics">${raw}</div>`;
    }
  }

  if (sectionOpen) {
    html += `</section>`;
  }

  this.highlightedLyrics = html;
}


  /* ==================== TRANSPOSICIÓN ==================== */

  transposeUp(): void {
    this.applyTranspose(1);
  }

  transposeDown(): void {
    this.applyTranspose(-1);
  }

  private applyTranspose(semitones: number): void {
    const letra = this.songForm.get('letra')?.value ?? '';
    const tono = this.songForm.get('tonoOriginal')?.value ?? '';

    this.songForm.patchValue({
      letra: this.transposeService.transposeText(letra, semitones),
      tonoOriginal: this.transposeService.transposeChord(tono, semitones)
    });
  }

  /* ==================== ACCIONES ==================== */

  saveSong(): void {
    if (this.songForm.invalid) return;
    this.songService.addSong(this.songForm.getRawValue())
      .subscribe(() => this.songSaved.emit());
  }

  onCancel(): void {
    this.songForm.reset({ tonoOriginal: 'C' });
    this.cancel.emit();
    this.router.navigate(['/cancion']);
  }
}
