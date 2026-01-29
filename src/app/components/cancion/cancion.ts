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
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  private sanitizer = inject(DomSanitizer); // ✅ AÑADIDO (no reemplaza nada)

  @Output() songSaved = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  songForm!: FormGroup;

  categorias: Categoria[] = [];
  songs: Song[] = [];
  filteredSongs: Song[] = [];

  highlightedLyrics!: SafeHtml; // ✅ antes string
  mode: 'edit' | 'view' = 'edit';

  /* ==================== INIT ==================== */

  ngOnInit(): void {
    this.songForm = this.fb.group({
      id: [null],
      tituloCancion: ['', Validators.required],
      tonoOriginal: ['C', Validators.required],
      tonoFinal: ['C'],              // UI-only
      idCategoria: [null, Validators.required],
      letra: ['', Validators.required]
    });

    // Sincronizar tonoFinal con tonoOriginal
    this.songForm.get('tonoOriginal')!.valueChanges.subscribe(tono => {
      this.songForm.get('tonoFinal')!.setValue(tono, { emitEvent: false });
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
    this.songService.getSongs().subscribe(songs => {
      this.songs = songs;
      this.filteredSongs = [...songs];
    });
  }

  filterSongs(event: any): void {
    const query = (event.query ?? '').toLowerCase();
    this.filteredSongs = this.songs.filter(song =>
      song.tituloCancion.toLowerCase().includes(query) ||
      song.letra.toLowerCase().includes(query)
    );
  }

  onSongSelected(event: any): void {
    const song: Song = event.value;

    this.songForm.patchValue({
      id: song.id,
      tituloCancion: song.tituloCancion,
      tonoOriginal: song.tonoOriginal,
      tonoFinal: song.tonoOriginal,
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

    for (const raw of lines) {
      const trimmed = raw.trim();
      if (!trimmed) continue;

      if (this.isSectionHeader(trimmed)) {
        if (sectionOpen) html += `</section>`;
        html += `<section><h3>${this.escapeHtml(this.cleanSectionHeader(trimmed))}</h3>`;
        sectionOpen = true;
        continue;
      }

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

      html += `<div class="lyrics">${this.escapeHtml(raw)}</div>`;
    }

    if (sectionOpen) html += `</section>`;

    // ✅ ÚNICA CORRECCIÓN FUNCIONAL
    this.highlightedLyrics =
      this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private isSectionHeader(line: string): boolean {
    return /^(\/\/\s*)?(intro|estrofa|coro|verso|puente|bridge|outro)(\s+\d+|\s+[IVX]+)?$/i.test(line);
  }

  private cleanSectionHeader(line: string): string {
    return line.replace(/^\/\/\s*/, '');
  }

  private hasInlineChords(line: string): boolean {
    return /\[([^\]]+)\]/.test(line);
  }

  private parseInlineChords(raw: string): { chordLine: string; lyricLine: string } {
    const lyricLine =  raw.replace(/\[[^\]]+\]/g, '');

    let chordLine = '';
    let i = 0;

    while (i < raw.length) {
      if (raw[i] === '[') {
        const end = raw.indexOf(']', i);
        if (end !== -1) {
          chordLine += `<span class="chord">${this.escapeHtml(raw.substring(i + 1, end))}</span>`;
          i = end + 1;
        } else {
          chordLine += ' ';
          i++;
        }
      } else {
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

    const newTono = this.transposeService.transposeChord(tono, semitones);

    this.songForm.patchValue({
      letra: this.transposeService.transposeText(letra, semitones),
      tonoOriginal: newTono,
      tonoFinal: newTono
    });
  }

  /* ==================== ACCIONES ==================== */

  saveSong(): void {
    if (this.songForm.invalid) {
      alert('Por favor, completa todos los campos requeridos.');
      return;
    }

    const formValue = this.songForm.getRawValue();

    const payload: any = {
      id: formValue.id,
      tituloCancion: formValue.tituloCancion,
      tonoOriginal: formValue.tonoOriginal,
      idCategoria: formValue.idCategoria,
      letra: formValue.letra
    };

    const isNew = !payload.id;
    if (isNew) delete payload.id;

    this.songService.saveSong(payload).subscribe({
      next: () => {
        alert(`Canción ${isNew ? 'creada' : 'actualizada'} con éxito.`);
        this.songSaved.emit();
        this.resetForm();
        this.loadSongs();
      },
      error: (err) => {
        console.error('Error al guardar la canción:', err);
        alert('Ocurrió un error al guardar la canción.');
      }
    });
  }

  deleteSong(): void {
    const id = this.songForm.get('id')?.value;
    if (!id) return;

    if (!confirm('¿Estás seguro de que deseas eliminar esta canción?')) return;

    this.songService.deleteSong(id).subscribe({
      next: () => {
        alert('Canción eliminada con éxito.');
        this.songSaved.emit();
        this.resetForm();
        this.loadSongs();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        alert('Ocurrió un error al eliminar.');
      }
    });
  }

  onCancel(): void {
    this.resetForm();
    this.cancel.emit();
  }

  private resetForm(): void {
    this.songForm.reset({
      id: null,
      tituloCancion: '',
      tonoOriginal: 'C',
      tonoFinal: 'C',
      idCategoria: null,
      letra: ''
    });

    this.updateHighlight('');
  }

  /* ==================== EXPORTACIÓN ==================== */

  exportAs(format: 'pdf' | 'jpg' | 'ppt'): void {
    const exportAction = () => {
      const element = document.querySelector('.song-view') as HTMLElement;
      if (!element) return;
      this.runExport(format, element);
    };

    if (this.mode !== 'view') {
      this.mode = 'view';
      setTimeout(exportAction, 100);
    } else {
      exportAction();
    }
  }

  private runExport(format: 'pdf' | 'jpg' | 'ppt', element: HTMLElement) {
    const title = this.songForm.get('tituloCancion')?.value || 'cancion';
    const fileName = title.replace(/ /g, '_');

    if (format === 'pdf') this.exportAsPdf(element, fileName);
    if (format === 'jpg') this.exportAsJpg(element, fileName);
    if (format === 'ppt') this.exportAsPpt(fileName);
  }

  private exportAsPdf(element: HTMLElement, fileName: string): void {
    html2canvas(element).then(canvas => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = pdf.internal.pageSize.getWidth();
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, width, height);
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

    const titleSlide = pptx.addSlide();
    titleSlide.addText(title, { x: 0.5, y: 2.5, w: '90%', fontSize: 48, bold: true, align: 'center' });
    titleSlide.addText(`Tono: ${tone}`, { x: 0.5, y: 3.5, w: '90%', fontSize: 24, align: 'center' });

    const lines = rawLyrics.split('\n');
    let slide = pptx.addSlide();
    let lineCount = 0;

    for (const line of lines) {
      if (!line.trim()) continue;
      if (lineCount >= 8) {
        slide = pptx.addSlide();
        lineCount = 0;
      }
      slide.addText(line, { x: 0.5, y: 0.5 + lineCount * 0.6, w: '90%' });
      lineCount++;
    }

    pptx.writeFile({ fileName: `${fileName}.pptx` });
  }
}
