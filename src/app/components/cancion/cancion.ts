import {
  Component,
  inject,
  OnInit,
  EventEmitter,
  Output,
  ViewEncapsulation
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
import { TooltipModule } from 'primeng/tooltip';

/* Servicios */
import { SongService } from '../../services/song.service';
import { TransposeService } from '../../services/transpose.service';
import { CategoriaService } from '../../services/categoria.service';

/* Modelos */
import { Song } from '../../models/song.model';
import { Categoria } from '../../../interfaces/categoria';

/* Componentes */
import { ToolbarComponent } from '../toolbar/toolbar';

/* Exportación */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PptxGenJS from 'pptxgenjs';

/* Importación */



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
    ToolbarComponent,
    TooltipModule
  ],
  templateUrl: './cancion.html',
  styleUrls: ['./cancion.css'],
  encapsulation: ViewEncapsulation.None
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

    const lines = text.split('\n');

    let html = `
      <div class="song-header">
        <h1>${this.escapeHtml(titulo)}</h1>
        <div class="song-meta">Tono: ${this.escapeHtml(tono)}</div>
      </div>
    `;

    let sectionOpen = false;

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const trimmed = raw.trim();

      /* ===== LÍNEA VACÍA ===== */
      if (!trimmed) {
        continue;
      }

      /* ===== ENCABEZADOS DE SECCIÓN ===== */
      if (this.isSectionHeader(trimmed)) {
        if (sectionOpen) {
          html += `</section>`;
        }
        html += `<section><h3>${this.escapeHtml(this.cleanSectionHeader(trimmed))}</h3>`;
        sectionOpen = true;
        continue;
      }

      /* ===== LÍNEAS CON ACORDES INLINE [Am] ===== */
      if (this.hasInlineChords(raw)) {
        const { chordLine, lyricLine } = this.parseInlineChords(raw);
        
        html += `
          <div class="music-line">
            <div class="chords">${chordLine}</div>
            <div class="lyrics">${lyricLine}</div>
          </div>
        `;
        continue;
      }

      /* ===== LETRA SIMPLE ===== */
      html += `<div class="lyrics">${this.escapeHtml(raw)}</div>`;
    }

    if (sectionOpen) {
      html += `</section>`;
    }

    this.highlightedLyrics = html;
  }

  private isSectionHeader(line: string): boolean {
    return /^(coro|estrofa|verso|verse|chorus|bridge|intro|outro|pre-coro|pre-chorus)(\s+\d+|\s+[IVX]+)?$/i.test(line);
  }

  private cleanSectionHeader(line: string): string {
    return line.replace(/^\/\/\s*/, '');
  }

  private hasInlineChords(line: string): boolean {
    return /\[([^\]]+)\]/.test(line);
  }

  private parseInlineChords(raw: string): { chordLine: string; lyricLine: string } {
    // 1. Get the pure lyric line by removing chord markers
    const lyricLine = this.escapeHtml(raw.replace(/\[[^\]]+\]/g, ''));

    // 2. Build the chord line, using the raw string for positioning
    let chordLine = '';
    let i = 0;
    while (i < raw.length) {
      if (raw[i] === '[') {
        const chordEnd = raw.indexOf(']', i);
        if (chordEnd !== -1) {
          const chord = raw.substring(i + 1, chordEnd);
          // Add the styled chord
          chordLine += `<span class="chord">${this.escapeHtml(chord)}</span>`;
          // Advance the index past the entire chord marker
          i = chordEnd + 1;
        } else {
          // Unmatched '[', treat as a literal character
          chordLine += ' ';
          i++;
        }
      } else {
        // It's a regular character in the lyric, so add a space to the chord line
        chordLine += ' ';
        i++;
      }
    }

    return { chordLine, lyricLine };
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
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

    const newTitle = this.songForm.get('tituloCancion')?.value;
    const currentId = this.songForm.get('id')?.value;

    // Validate for duplicate title
    const isDuplicate = this.songs.some(song =>
      song.id !== currentId && song.tituloCancion.toLowerCase() === newTitle.toLowerCase()
    );

    if (isDuplicate) {
      alert('Ya existe una canción con este título. Por favor, elige otro.');
      return; // Prevent saving
    }

    this.songService.addSong(this.songForm.getRawValue())
      .subscribe(() => {
        this.songSaved.emit();
        alert('Canción guardada con éxito.'); // Añadido para notificar al usuario
      });
  }

  onCancel(): void {
    this.songForm.reset({ tonoOriginal: 'C' });
    this.cancel.emit();
    this.router.navigate(['/cancion']);
  }

  /* ==================== EXPORTACIÓN ==================== */

  exportAs(format: 'pdf' | 'jpg' | 'ppt'): void {
    const songViewElement = document.querySelector('.song-view') as HTMLElement;
    
    const exportAction = () => {
      const elementToExport = document.querySelector('.song-view') as HTMLElement;
      if (!elementToExport) {
        console.error('Elemento .song-view no encontrado para exportar.');
        return;
      }
      this.runExport(format, elementToExport);
    };

    if (this.mode !== 'view') {
      this.mode = 'view';
      setTimeout(exportAction, 100); // Espera a que Angular renderice
    } else {
      exportAction();
    }
  }

  private runExport(format: 'pdf' | 'jpg' | 'ppt', element: HTMLElement) {
    const title = this.songForm.get('tituloCancion')?.value || 'cancion';
    const fileName = title.replace(/ /g, '_');

    switch (format) {
      case 'pdf':
        this.exportAsPdf(element, fileName);
        break;
      case 'jpg':
        this.exportAsJpg(element, fileName);
        break;
      case 'ppt':
        this.exportAsPpt(fileName);
        break;
    }
  }

  private exportAsPdf(element: HTMLElement, fileName: string): void {
    html2canvas(element).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fileName}.pdf`);
    });
  }

  private exportAsJpg(element: HTMLElement, fileName: string): void {
    html2canvas(element).then(canvas => {
      const link = document.createElement('a');
      link.download = `${fileName}.jpg`;
      link.href = canvas.toDataURL('image/jpeg');
      link.click();
    });
  }

  private exportAsPpt(fileName: string): void {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';

    const title = this.songForm.get('tituloCancion')?.value || 'Canción';
    const tone = this.songForm.get('tonoOriginal')?.value || '';
    const rawLyrics = this.songForm.get('letra')?.value || '';

    // Diapositiva de Título
    const titleSlide = pptx.addSlide();
    titleSlide.addText(title, { x: 0.5, y: 2.5, w: '90%', h: 1, align: 'center', fontSize: 48, bold: true, color: '1F4788' });
    titleSlide.addText(`Tono: ${tone}`, { x: 0.5, y: 3.5, w: '90%', h: 1, align: 'center', fontSize: 24, color: '666666' });

    // Diapositivas de Letra
    const lines = rawLyrics.split('\n');
    const MAX_LINES_PER_SLIDE = 8;
    let slide = pptx.addSlide();
    let lineCount = 0;

    for (const rawLine of lines) {
      if (lineCount >= MAX_LINES_PER_SLIDE) {
        slide = pptx.addSlide();
        lineCount = 0;
      }

      const trimmedLine = rawLine.trim();
      if (!trimmedLine) continue;

      if (this.hasInlineChords(rawLine)) {
        const { chordLine, lyricLine } = this.parseInlineChords(rawLine);
        const plainChordLine = chordLine.replace(/<[^>]*>/g, '');

        slide.addText(plainChordLine, { x: 0.5, y: 0.5 + lineCount * 0.8, w: '90%', h: 0.4, fontFace: 'Courier New', fontSize: 18, color: '1F4788', bold: true });
        slide.addText(lyricLine, { x: 0.5, y: 0.8 + lineCount * 0.8, w: '90%', h: 0.4, fontFace: 'Courier New', fontSize: 18, color: '000000' });
        lineCount += 1.5;
      } else {
        const isHeader = this.isSectionHeader(trimmedLine);
        slide.addText(rawLine, { x: 0.5, y: 0.8 + lineCount * 0.8, w: '90%', h: 0.4, fontSize: isHeader ? 16 : 18, bold: isHeader });
        lineCount++;
      }
    }

    pptx.writeFile({ fileName: `${fileName}.pptx` });
  }

  /* ==================== IMPORTACIÓN ==================== */

 }